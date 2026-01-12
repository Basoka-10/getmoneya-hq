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

export function useTaskReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
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

  // Send a notification
  const sendNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        tag: "task-reminder",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
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
            `${task.title} - dans ${task.reminder_minutes} minutes`
          );
          await markTaskAsReminded(task.id);
          
          // Also show a toast for in-app notification
          toast.info(`Rappel: ${task.title}`, {
            description: `À faire dans ${task.reminder_minutes} minutes`,
            duration: 10000,
          });
        }
      }
    } catch (error) {
      console.error("Error checking upcoming tasks:", error);
    }
  }, [user?.id, sendNotification, markTaskAsReminded]);

  // Initialize reminders on mount
  useEffect(() => {
    if (!user?.id) return;

    // Check permission on mount
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check immediately on mount
    checkUpcomingTasks();

    // Set up interval to check every minute
    intervalRef.current = setInterval(checkUpcomingTasks, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id, checkUpcomingTasks]);

  return {
    notificationPermission,
    requestPermission,
    isSupported: "Notification" in window,
  };
}

// Provider component to use in App
export function TaskReminderProvider({ children }: { children: React.ReactNode }) {
  useTaskReminders();
  return children;
}