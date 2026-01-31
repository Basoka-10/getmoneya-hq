import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export interface ApiLog {
  id: string;
  user_id: string;
  api_key_id: string | null;
  endpoint: string;
  method: string;
  source: string | null;
  status_code: number;
  error_message: string | null;
  ip_address: string | null;
  response_time_ms: number | null;
  created_at: string;
}

export interface ApiLimits {
  plan: string;
  max_api_keys: number;
  max_sales_per_month: number;
  webhooks_enabled: boolean;
  advanced_logs: boolean;
  rate_limit_per_minute: number;
}

// Hook to fetch user's API keys
export function useApiKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      // Explicitly select only needed columns - exclude key_hash for security
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, user_id, name, key_prefix, is_active, created_at, last_used_at, expires_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
  });
}

// Hook to fetch API logs
export function useApiLogs(limit = 50) {
  return useQuery({
    queryKey: ["api-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ApiLog[];
    },
  });
}

// Hook to get API usage stats
export function useApiStats() {
  return useQuery({
    queryKey: ["api-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Check if user is owner (admin) - they get business plan limits
      const { data: isOwner } = await supabase.rpc("is_owner");
      
      let userLimits: ApiLimits;
      
      if (isOwner) {
        // Owners get business limits
        const { data: businessLimits } = await supabase
          .from("api_limits")
          .select("*")
          .eq("plan", "business")
          .single();
        
        userLimits = businessLimits || {
          plan: "business",
          max_api_keys: 999999,
          max_sales_per_month: 10000,
          webhooks_enabled: true,
          advanced_logs: true,
          rate_limit_per_minute: 100,
        };
      } else {
        // Get limits based on subscription
        const { data: limits } = await supabase.rpc("get_user_api_limits", { _user_id: user.id });
        userLimits = (limits as ApiLimits[] | null)?.[0] || {
          plan: "free",
          max_api_keys: 2,
          max_sales_per_month: 50,
          webhooks_enabled: false,
          advanced_logs: false,
          rate_limit_per_minute: 10,
        };
      }
      
      // Get current usage
      const { data: salesCount } = await supabase.rpc("get_api_sales_this_month", { _user_id: user.id });
      const { data: keysCount } = await supabase.rpc("get_active_api_keys_count", { _user_id: user.id });

      // Get recent errors
      const { data: errors } = await supabase
        .from("api_logs")
        .select("*")
        .neq("status_code", 200)
        .neq("status_code", 201)
        .order("created_at", { ascending: false })
        .limit(10);

      return {
        limits: userLimits,
        usage: {
          salesThisMonth: salesCount || 0,
          activeKeys: keysCount || 0,
        },
        recentErrors: errors || [],
      };
    },
  });
}

// Generate a random API key
function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "mny_";
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Hash a string using SHA-256
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Hook to create a new API key
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<{ key: string; keyData: ApiKey }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Check if user can create more keys
      const { data: canCreate } = await supabase.rpc("can_create_api_key", { _user_id: user.id });
      if (!canCreate) {
        throw new Error("Limite de clés API atteinte pour votre plan");
      }

      // Generate and hash the key
      const rawKey = generateApiKey();
      const keyHash = await hashKey(rawKey);
      const keyPrefix = rawKey.substring(0, 8);

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
        })
        .select()
        .single();

      if (error) throw error;

      return { key: rawKey, keyData: data as ApiKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-stats"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Hook to toggle API key status
export function useToggleApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("api_keys")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-stats"] });
      toast.success(isActive ? "Clé API activée" : "Clé API désactivée");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Hook to delete an API key
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-stats"] });
      toast.success("Clé API supprimée");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Hook to regenerate an API key
export function useRegenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const rawKey = generateApiKey();
      const keyHash = await hashKey(rawKey);
      const keyPrefix = rawKey.substring(0, 8);

      const { error } = await supabase
        .from("api_keys")
        .update({
          key_hash: keyHash,
          key_prefix: keyPrefix,
          last_used_at: null,
        })
        .eq("id", id);

      if (error) throw error;

      return rawKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("Clé API régénérée");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}
