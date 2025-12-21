import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionPlan = "free" | "pro" | "business";

interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: string;
  payment_id: string | null;
  amount: number | null;
  currency: string | null;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Check if subscription is expired
      if (data && data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        if (expiryDate < new Date()) {
          // Subscription expired, treat as free
          setSubscription({ ...data, plan: "free" as SubscriptionPlan, status: "expired" });
        } else {
          setSubscription(data as Subscription);
        }
      } else {
        setSubscription(data as Subscription | null);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  const currentPlan: SubscriptionPlan = subscription?.plan || "free";
  const isActive = subscription?.status === "active";
  const isPro = currentPlan === "pro" && isActive;
  const isBusiness = currentPlan === "business" && isActive;
  const isPaid = isPro || isBusiness;

  return {
    subscription,
    currentPlan,
    isActive,
    isPro,
    isBusiness,
    isPaid,
    isLoading,
    error,
    refetch: fetchSubscription,
  };
};
