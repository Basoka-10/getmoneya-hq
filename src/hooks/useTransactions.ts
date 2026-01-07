import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Transaction = {
  id: string;
  user_id: string;
  type: "income" | "expense" | "savings";
  amount: number;
  description: string;
  category: string;
  date: string;
  client_id: string | null;
  currency_code: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTransactionInput = {
  type: "income" | "expense" | "savings";
  amount: number;
  description: string;
  category: string;
  date: string;
  client_id?: string | null;
  currency_code?: string;
};

export function useTransactions(type?: "income" | "expense" | "savings") {
  return useQuery({
    queryKey: ["transactions", type],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Get user's currency preference if not provided
      let currencyCode = input.currency_code;
      if (!currencyCode) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("currency_preference")
          .eq("user_id", user.id)
          .maybeSingle();
        currencyCode = profile?.currency_preference || "XOF";
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...input,
          user_id: user.id,
          currency_code: currencyCode,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction ajoutée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout: " + error.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié - veuillez vous reconnecter");

      console.log("Suppression transaction:", id, "pour user:", user.id);

      const { data, error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Erreur DB suppression transaction:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Transaction introuvable ou accès refusé");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-stats"] });
      toast.success("Transaction supprimée");
    },
    onError: (error) => {
      console.error("Erreur suppression transaction:", error);
      toast.error("Erreur: " + error.message);
    },
  });
}

export type UpdateTransactionInput = {
  id: string;
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  client_id?: string | null;
};

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTransactionInput) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction modifiée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la modification: " + error.message);
    },
  });
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/**
 * Hook to get transaction stats with display-time currency conversion.
 * All amounts are converted from their original currency to the user's display currency.
 */
export function useTransactionStats(dateRange?: DateRange) {
  return useQuery({
    queryKey: ["transaction-stats", dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("type, amount, date, currency_code");

      // Apply date filtering if provided
      if (dateRange?.from) {
        const fromDate = dateRange.from.toISOString().split('T')[0];
        query = query.gte("date", fromDate);
      }
      if (dateRange?.to) {
        const toDate = dateRange.to.toISOString().split('T')[0];
        query = query.lte("date", toDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Return raw transactions data - conversion happens in the component
      return data as { type: string; amount: number; date: string; currency_code: string | null }[];
    },
  });
}

/**
 * Hook to calculate transaction stats with currency conversion applied.
 * Uses the CurrencyContext to convert amounts at display time.
 */
export function useConvertedTransactionStats(
  transactions: { type: string; amount: number; currency_code: string | null }[] | undefined,
  convertAmount: (amount: number, fromCurrency: string | null | undefined) => number
) {
  if (!transactions) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      balance: 0,
      percentageSpent: 0,
    };
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + convertAmount(Number(t.amount), t.currency_code), 0);
  
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + convertAmount(Number(t.amount), t.currency_code), 0);

  const totalSavings = transactions
    .filter((t) => t.type === "savings")
    .reduce((acc, t) => acc + convertAmount(Number(t.amount), t.currency_code), 0);

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    balance: totalIncome - totalExpenses - totalSavings,
    percentageSpent: totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0,
  };
}
