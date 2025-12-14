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

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          ...input,
          user_id: user.id,
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
      const updateData = {
        ...input,
        items: input.items ? JSON.stringify(input.items) : undefined,
      };

      const { data, error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture supprimée");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}
