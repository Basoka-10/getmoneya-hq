import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hook to synchronize all user transactions when currency changes.
 * Converts all amounts from old currency to new currency via EUR.
 */
export function useTransactionCurrencySync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const syncTransactionsCurrency = useCallback(
    async (
      oldCurrency: string,
      newCurrency: string,
      exchangeRates: Record<string, number>
    ) => {
      if (!user || oldCurrency === newCurrency) return;

      const newRate = exchangeRates[newCurrency] || 1;

      // Convert from source currency to EUR, then from EUR to new currency
      const convertAmount = (amount: number, fromCurrency: string) => {
        const sourceRate = exchangeRates[fromCurrency] || 1;
        const amountInEur = amount / sourceRate;
        return Number((amountInEur * newRate).toFixed(2));
      };

      try {
        // Fetch all user transactions with their current currency
        const { data: transactions, error: transactionsError } = await supabase
          .from("transactions")
          .select("id, amount, currency_code")
          .eq("user_id", user.id);

        if (transactionsError) throw transactionsError;

        if (!transactions || transactions.length === 0) {
          return;
        }

        // Update each transaction
        for (const transaction of transactions) {
          const sourceCurrency = transaction.currency_code || oldCurrency;
          const convertedAmount = convertAmount(
            Number(transaction.amount) || 0,
            sourceCurrency
          );

          await supabase
            .from("transactions")
            .update({
              amount: convertedAmount,
              currency_code: newCurrency,
            })
            .eq("id", transaction.id);
        }

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        await queryClient.invalidateQueries({ queryKey: ["transaction-stats"] });

        toast.success(`${transactions.length} transaction(s) convertie(s) vers ${newCurrency}`);
      } catch (error) {
        console.error("Error syncing transactions currency:", error);
        toast.error("Erreur lors de la conversion des transactions");
      }
    },
    [user, queryClient]
  );

  return { syncTransactionsCurrency };
}
