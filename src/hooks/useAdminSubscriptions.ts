import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogActivity } from "./useAdmin";

// Revoke a user's subscription (set to free)
export function useRevokeSubscription() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan: "free",
          status: "revoked",
          expires_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      await logActivity.mutateAsync({
        action: "subscription_revoked",
        entity_type: "subscription",
        entity_id: userId,
        details: { action: "revoked_to_free" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Abonnement révoqué - Utilisateur passé en plan gratuit");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Extend a user's subscription
export function useExtendSubscription() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ userId, days }: { userId: string; days: number }) => {
      // First get current subscription
      const { data: subscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("expires_at, plan")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!subscription || subscription.plan === "free") {
        throw new Error("L'utilisateur n'a pas d'abonnement payant à prolonger");
      }

      // Calculate new expiry date
      const currentExpiry = subscription.expires_at
        ? new Date(subscription.expires_at)
        : new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + days);

      const { error } = await supabase
        .from("subscriptions")
        .update({
          expires_at: newExpiry.toISOString(),
          status: "active",
        })
        .eq("user_id", userId);

      if (error) throw error;

      await logActivity.mutateAsync({
        action: "subscription_extended",
        entity_type: "subscription",
        entity_id: userId,
        details: { days_added: days, new_expiry: newExpiry.toISOString() },
      });
    },
    onSuccess: (_, { days }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Abonnement prolongé de ${days} jours`);
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

// Update a user's plan
export function useUpdateUserPlan() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({
      userId,
      plan,
      durationDays = 365,
    }: {
      userId: string;
      plan: "free" | "pro" | "business";
      durationDays?: number;
    }) => {
      const expiresAt =
        plan === "free"
          ? null
          : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      // Check if subscription exists
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan,
            status: "active",
            expires_at: expiresAt,
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").insert({
          user_id: userId,
          plan,
          status: "active",
          expires_at: expiresAt,
        });

        if (error) throw error;
      }

      await logActivity.mutateAsync({
        action: "subscription_updated",
        entity_type: "subscription",
        entity_id: userId,
        details: { new_plan: plan, duration_days: durationDays },
      });
    },
    onSuccess: (_, { plan }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Plan mis à jour: ${plan.charAt(0).toUpperCase() + plan.slice(1)}`);
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}
