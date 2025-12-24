import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

/**
 * Hook to synchronize all user documents (invoices/quotations) when currency changes.
 * Converts all amounts from old currency to new currency and updates currency_code.
 */
export function useDocumentCurrencySync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const syncDocumentsCurrency = useCallback(
    async (
      oldCurrency: string,
      newCurrency: string,
      exchangeRates: Record<string, number>
    ) => {
      if (!user || oldCurrency === newCurrency) return;

      const oldRate = exchangeRates[oldCurrency] || 1;
      const newRate = exchangeRates[newCurrency] || 1;

      // Convert from old currency to EUR, then from EUR to new currency
      const convertAmount = (amount: number, fromCurrency?: string | null) => {
        const sourceCurrency = fromCurrency || oldCurrency;
        const sourceRate = exchangeRates[sourceCurrency] || 1;
        const amountInEur = amount / sourceRate;
        return Number((amountInEur * newRate).toFixed(2));
      };

      const parseItems = (items: unknown): LineItem[] => {
        if (!items) return [];
        if (typeof items === "string") {
          try {
            const parsed = JSON.parse(items);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        if (Array.isArray(items)) return items as LineItem[];
        return [];
      };

      try {
        // Fetch all user invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from("invoices")
          .select("id, amount, items, currency_code")
          .eq("user_id", user.id);

        if (invoicesError) throw invoicesError;

        // Fetch all user quotations
        const { data: quotations, error: quotationsError } = await supabase
          .from("quotations")
          .select("id, amount, items, currency_code")
          .eq("user_id", user.id);

        if (quotationsError) throw quotationsError;

        // Update invoices
        for (const invoice of invoices || []) {
          const sourceCurrency = invoice.currency_code || oldCurrency;
          const parsedItems = parseItems(invoice.items);
          
          const convertedItems = parsedItems.map((item) => ({
            ...item,
            unit_price: convertAmount(Number(item.unit_price) || 0, sourceCurrency),
          }));

          const convertedAmount = convertAmount(Number(invoice.amount) || 0, sourceCurrency);

          await supabase
            .from("invoices")
            .update({
              amount: convertedAmount,
              items: convertedItems,
              currency_code: newCurrency,
            })
            .eq("id", invoice.id);
        }

        // Update quotations
        for (const quotation of quotations || []) {
          const sourceCurrency = quotation.currency_code || oldCurrency;
          const parsedItems = parseItems(quotation.items);
          
          const convertedItems = parsedItems.map((item) => ({
            ...item,
            unit_price: convertAmount(Number(item.unit_price) || 0, sourceCurrency),
          }));

          const convertedAmount = convertAmount(Number(quotation.amount) || 0, sourceCurrency);

          await supabase
            .from("quotations")
            .update({
              amount: convertedAmount,
              items: convertedItems,
              currency_code: newCurrency,
            })
            .eq("id", quotation.id);
        }

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ["invoices"] });
        await queryClient.invalidateQueries({ queryKey: ["quotations"] });

        const totalDocs = (invoices?.length || 0) + (quotations?.length || 0);
        if (totalDocs > 0) {
          toast.success(`${totalDocs} document(s) mis à jour vers ${newCurrency}`);
        }
      } catch (error) {
        console.error("Error syncing documents currency:", error);
        toast.error("Erreur lors de la mise à jour des documents");
      }
    },
    [user, queryClient]
  );

  return { syncDocumentsCurrency };
}
