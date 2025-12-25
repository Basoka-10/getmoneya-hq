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

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...input,
          user_id: user.id,
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
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction supprimée");
    },
    onError: (error) => {
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

export function useTransactionStats() {
  return useQuery({
    queryKey: ["transaction-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount");

      if (error) throw error;

      const transactions = data as { type: string; amount: number }[];
      
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0);
      
      const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const totalSavings = transactions
        .filter((t) => t.type === "savings")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      return {
        totalIncome,
        totalExpenses,
        totalSavings,
        balance: totalIncome - totalExpenses - totalSavings,
        percentageSpent: totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0,
      };
    },
  });
}
