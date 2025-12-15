import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  company_name: string | null;
  phone: string | null;
  is_suspended: boolean;
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

// Check if current user is owner
export function useIsOwner() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["is-owner", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc("is_owner", {
        _user_id: user.id,
      });
      
      if (error) {
        console.error("Error checking owner status:", error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user,
  });
}

// Fetch all users with profiles
export function useAllUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (profilesError) throw profilesError;
      
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      
      if (rolesError) throw rolesError;
      
      return (profiles as Profile[]).map((profile) => ({
        ...profile,
        user_roles: (roles as UserRole[]).filter((r) => r.user_id === profile.user_id),
      }));
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
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");
      
      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, { full_name: p.full_name, email: p.email }])
      );
      
      return (logs as ActivityLog[]).map((log) => ({
        ...log,
        profiles: log.user_id ? profileMap.get(log.user_id) || null : null,
      }));
    },
  });
}

// Log activity
export function useLogActivity() {
  return useMutation({
    mutationFn: async (log: {
      action: string;
      entity_type?: string;
      entity_id?: string;
      details?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("activity_logs")
        .insert([{
          user_id: user?.id || null,
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
