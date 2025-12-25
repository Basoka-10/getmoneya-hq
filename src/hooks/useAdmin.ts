import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_logo: string | null;
  is_suspended: boolean;
  currency_preference: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfilePrivate {
  id: string;
  user_id: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "user" | "owner";
  created_at: string;
}

export interface FreeLimit {
  id: string;
  limit_name: string;
  limit_value: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: unknown;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Check if current user is owner (using parameterless function)
export function useIsOwner() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["is-owner", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      // Call the parameterless is_owner() function
      const { data, error } = await supabase.rpc("is_owner");
      
      if (error) {
        console.error("Error checking owner status:", error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user,
  });
}

// Fetch all users with profiles (admin only - can access profiles_private)
export function useAllUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50); // Pagination limit to prevent enumeration
      
      if (profilesError) throw profilesError;
      
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      
      if (rolesError) throw rolesError;
      
      // For admin, also fetch private data (will only work if user is owner via backend function)
      const { data: privateProfiles } = await supabase
        .from("profiles_private")
        .select("user_id, email, phone, address");
      
      // Fetch subscriptions to know each user's plan
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id, plan, status, expires_at");
      
      const privateMap = new Map(
        (privateProfiles || []).map((p) => [p.user_id, p])
      );
      
      const subscriptionMap = new Map(
        (subscriptions || []).map((s) => [s.user_id, s])
      );
      
      return (profiles as Profile[]).map((profile) => {
        const subscription = subscriptionMap.get(profile.user_id);
        let currentPlan = "free";
        let subscriptionExpiresAt: string | null = null;
        
        if (subscription) {
          subscriptionExpiresAt = subscription.expires_at;
          // Check if subscription is expired
          if (subscription.expires_at) {
            const expiryDate = new Date(subscription.expires_at);
            if (expiryDate >= new Date() && subscription.status === "active") {
              currentPlan = subscription.plan;
            }
          } else if (subscription.status === "active") {
            currentPlan = subscription.plan;
          }
        }
        
        return {
          ...profile,
          // Add private data if available (only for owner viewing their own users in admin)
          private_data: privateMap.get(profile.user_id) || null,
          user_roles: (roles as UserRole[]).filter((r) => r.user_id === profile.user_id),
          subscription_plan: currentPlan,
          subscription_expires_at: subscriptionExpiresAt,
        };
      });
    },
  });
}

// Fetch free limits
export function useFreeLimits() {
  return useQuery({
    queryKey: ["free-limits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("free_limits")
        .select("*")
        .order("limit_name");
      
      if (error) throw error;
      return data as FreeLimit[];
    },
  });
}

// Update free limit
export function useUpdateFreeLimit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, limit_value }: { id: string; limit_value: number }) => {
      const { error } = await supabase
        .from("free_limits")
        .update({ limit_value })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["free-limits"] });
      toast.success("Limite mise à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Fetch activity logs
export function useActivityLogs() {
  return useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => {
      const { data: logs, error: logsError } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (logsError) throw logsError;
      
      // Get public profile data
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name");
      
      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, { full_name: p.full_name }])
      );
      
      return (logs as ActivityLog[]).map((log) => ({
        ...log,
        profiles: log.user_id ? profileMap.get(log.user_id) || null : null,
      }));
    },
  });
}

// Log activity - user_id is now auto-set by trigger
export function useLogActivity() {
  return useMutation({
    mutationFn: async (log: {
      action: string;
      entity_type?: string;
      entity_id?: string;
      details?: Record<string, unknown>;
    }) => {
      // user_id is automatically set by the database trigger
      const { error } = await supabase
        .from("activity_logs")
        .insert([{
          action: log.action,
          entity_type: log.entity_type || null,
          entity_id: log.entity_id || null,
          details: log.details ? JSON.parse(JSON.stringify(log.details)) : null,
        }]);
      
      if (error) throw error;
    },
  });
}

// Fetch system settings
export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("setting_key");
      
      if (error) throw error;
      return data as SystemSetting[];
    },
  });
}

// Update system setting
export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, setting_value }: { id: string; setting_value: unknown }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({ setting_value: JSON.parse(JSON.stringify(setting_value)) })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Paramètre mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Suspend/Activate user
export function useToggleUserSuspension() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();
  
  return useMutation({
    mutationFn: async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: suspend })
        .eq("user_id", userId);
      
      if (error) throw error;
      
      await logActivity.mutateAsync({
        action: suspend ? "user_suspended" : "user_activated",
        entity_type: "user",
        entity_id: userId,
      });
    },
    onSuccess: (_, { suspend }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(suspend ? "Utilisateur suspendu" : "Utilisateur activé");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Fetch global stats
export function useGlobalStats() {
  return useQuery({
    queryKey: ["global-stats"],
    queryFn: async () => {
      const [users, clients, invoices, quotations, transactions, tasks] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }),
        supabase.from("quotations").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("id", { count: "exact", head: true }),
        supabase.from("tasks").select("id", { count: "exact", head: true }),
      ]);
      
      return {
        totalUsers: users.count || 0,
        totalClients: clients.count || 0,
        totalInvoices: invoices.count || 0,
        totalQuotations: quotations.count || 0,
        totalTransactions: transactions.count || 0,
        totalTasks: tasks.count || 0,
      };
    },
  });
}
