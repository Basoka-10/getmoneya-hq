import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserProfile {
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

export interface UserProfilePrivate {
  id: string;
  user_id: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch current user's public profile
export function useUserProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!user,
  });
}

// Fetch current user's private profile (email, phone, address)
export function useUserProfilePrivate() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-profile-private", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles_private")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserProfilePrivate | null;
    },
    enabled: !!user,
  });
}

// Update public profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (!user) throw new Error("Non authentifié");
      
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profil mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Update private profile (email, phone, address)
export function useUpdateProfilePrivate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<Omit<UserProfilePrivate, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (!user) throw new Error("Non authentifié");
      
      const { error } = await supabase
        .from("profiles_private")
        .update(data)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile-private"] });
      toast.success("Informations privées mises à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}
