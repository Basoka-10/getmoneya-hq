import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  due_date: string | null;
  due_time: string | null;
  reminder_minutes: number | null;
  reminder_sent: boolean;
  completed: boolean;
};

// Detect if device supports native notifications
const supportsNativeNotifications = (): boolean => {
  if (!("Notification" in window)) return false;
  
  // iOS Safari doesn't support web notifications properly
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  
  // iOS 16.4+ PWA supports notifications, but browser doesn't
  if (isIOS && !isStandalone) return false;
  
  return true;
};

// Play alarm sound
const playAlarmSound = () => {
  try {
    // Create an oscillator for alarm sound (works on all devices)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // Play a pleasant alarm pattern
    const now = audioContext.currentTime;
    playBeep(880, now, 0.15);
    playBeep(880, now + 0.2, 0.15);
    playBeep(1100, now + 0.4, 0.2);
    
  } catch (error) {
    console.log("Audio not supported:", error);
  }
};

// Vibrate device if supported
const vibrateDevice = () => {
  if ("vibrate" in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
};

export function useTaskReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(true);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!supportsNativeNotifications()) {
      // Even without native notifications, we support in-app alerts
      setNotificationPermission("granted");
      return true;
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === "granted";
    }

    setNotificationPermission(Notification.permission);
    return false;
  }, []);

  // Send a notification (with fallbacks for all devices)
  const sendNotification = useCallback((title: string, body: string, taskTitle: string) => {
    // Always play sound and vibrate (works on all devices)
    playAlarmSound();
    vibrateDevice();
    
    // Try native notification first
    if (supportsNativeNotifications() && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body,
          icon: "/logo.png",
          badge: "/logo.png",
          tag: "task-reminder",
          requireInteraction: true,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.log("Native notification failed:", error);
      }
    }
    
    // Always show in-app toast (works everywhere including iOS)
    toast.info(`⏰ ${taskTitle}`, {
      description: body,
      duration: 15000, // 15 seconds for important reminders
      action: {
        label: "OK",
        onClick: () => {},
      },
    });
  }, []);

  // Mark task as reminded
  const markTaskAsReminded = useCallback(async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ reminder_sent: true })
      .eq("id", taskId);

    if (error) {
      console.error("Error marking task as reminded:", error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  }, [queryClient]);

  // Check for upcoming tasks
  const checkUpcomingTasks = useCallback(async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("id, title, due_date, due_time, reminder_minutes, reminder_sent, completed")
        .eq("user_id", user.id)
        .eq("due_date", today)
        .eq("completed", false)
        .eq("reminder_sent", false)
        .not("due_time", "is", null)
        .not("reminder_minutes", "is", null);

      if (error) {
        console.error("Error fetching tasks for reminders:", error);
        return;
      }

      const now = new Date();

      for (const task of (tasks as Task[]) || []) {
        if (!task.due_time || !task.reminder_minutes) continue;

        // Parse due time
        const [hours, minutes] = task.due_time.split(":").map(Number);
        const dueDateTime = new Date();
        dueDateTime.setHours(hours, minutes, 0, 0);

        // Calculate reminder time
        const reminderTime = new Date(dueDateTime.getTime() - task.reminder_minutes * 60 * 1000);

        // Check if we should send reminder now (within the current minute)
        const diffMs = now.getTime() - reminderTime.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Send reminder if we're within 0-1 minute of the reminder time
        if (diffMinutes >= 0 && diffMinutes < 1) {
          sendNotification(
            "⏰ Rappel de tâche",
            `À faire dans ${task.reminder_minutes} minutes`,
            task.title
          );
          await markTaskAsReminded(task.id);
        }
      }
    } catch (error) {
      console.error("Error checking upcoming tasks:", error);
    }
  }, [user?.id, sendNotification, markTaskAsReminded]);

  // Initialize reminders on mount
  useEffect(() => {
    if (!user?.id) return;

    // Check native notification support
    setIsSupported(true); // We always support in-app notifications
    
    // Check permission on mount
    if (supportsNativeNotifications()) {
      setNotificationPermission(Notification.permission);
    } else {
      // For iOS and unsupported browsers, we use in-app notifications
      setNotificationPermission("granted");
    }

    // Check immediately on mount
    checkUpcomingTasks();

    // Set up interval to check every 30 seconds for better accuracy
    intervalRef.current = setInterval(checkUpcomingTasks, 30 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id, checkUpcomingTasks]);

  return {
    notificationPermission,
    requestPermission,
    isSupported,
    supportsNativeNotifications: supportsNativeNotifications(),
  };
}

// Provider component to use in App
export function TaskReminderProvider({ children }: { children: React.ReactNode }) {
  useTaskReminders();
  return children;
}
