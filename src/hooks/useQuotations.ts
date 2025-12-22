import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type QuotationItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type Quotation = {
  id: string;
  user_id: string;
  quotation_number: string;
  client_id: string | null;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  issue_date: string;
  valid_until: string;
  items: QuotationItem[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateQuotationInput = {
  quotation_number: string;
  client_id?: string | null;
  amount: number;
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
  issue_date: string;
  valid_until: string;
  items?: QuotationItem[];
  notes?: string | null;
};

export function useQuotations() {
  return useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("*, clients(name)")
        .order("issue_date", { ascending: false });

      if (error) throw error;
      return data as (Quotation & { clients: { name: string } | null })[];
    },
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuotationInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("quotations")
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
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Devis créé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Quotation> & { id: string }) => {
      // Clean undefined values to avoid sending them
      const cleanInput: Record<string, unknown> = {};
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanInput[key] = key === "items" ? JSON.stringify(value) : value;
        }
      });

      const { error } = await supabase
        .from("quotations")
        .update(cleanInput)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Devis mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quotations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Devis supprimé");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}
