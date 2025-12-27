import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type Invoice = {
  id: string;
  user_id: string;
  invoice_number: string;
  client_id: string | null;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  notes: string | null;
  currency_code: string;
  created_at: string;
  updated_at: string;
};

export type CreateInvoiceInput = {
  invoice_number: string;
  client_id?: string | null;
  amount: number;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string;
  items?: InvoiceItem[];
  notes?: string | null;
  currency_code?: string;
};

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, clients(name)")
        .order("issue_date", { ascending: false });

      if (error) throw error;
      return data as (Invoice & { clients: { name: string } | null })[];
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
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
        currencyCode = profile?.currency_preference || "EUR";
      }

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          ...input,
          user_id: user.id,
          currency_code: currencyCode,
          items: JSON.stringify(input.items || []),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture créée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Invoice> & { id: string }) => {
      // Si on passe à "paid", créer une transaction de revenu
      if (input.status === "paid") {
        // Récupérer les infos actuelles de la facture
        const { data: currentInvoice } = await supabase
          .from("invoices")
          .select("*, clients(name)")
          .eq("id", id)
          .single();

        // Ne créer la transaction que si le statut actuel n'est pas déjà "paid"
        if (currentInvoice && currentInvoice.status !== "paid") {
          // Vérifier si une transaction existe déjà pour cette facture
          const { data: existingTx } = await supabase
            .from("transactions")
            .select("id")
            .ilike("description", `%Facture ${currentInvoice.invoice_number}%`)
            .maybeSingle();

          if (!existingTx) {
            // Créer la transaction de revenu
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { error: txError } = await supabase.from("transactions").insert({
                user_id: user.id,
                type: "income" as const,
                amount: currentInvoice.amount,
                description: `Facture ${currentInvoice.invoice_number} payée`,
                category: "Factures",
                date: new Date().toISOString().split("T")[0],
                client_id: currentInvoice.client_id,
              });

              if (txError) {
                console.error("Erreur création transaction:", txError);
              }
            }
          }
        }
      }

      // Clean undefined values to avoid sending them
      const cleanInput: Record<string, unknown> = {};
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanInput[key] = key === "items" ? JSON.stringify(value) : value;
        }
      });

      const { error } = await supabase
        .from("invoices")
        .update(cleanInput)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-stats"] });
      toast.success("Facture mise à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture supprimée");
    },
    onError: (error) => {
      console.error("Erreur suppression facture:", error);
      toast.error("Erreur: " + error.message);
    },
  });
}
