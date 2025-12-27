import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: "task" | "appointment" | "reminder";
  start_date: string;
  end_date: string;
  all_day: boolean;
  task_id: string | null;
  client_id: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCalendarEventInput = {
  title: string;
  description?: string | null;
  event_type?: "task" | "appointment" | "reminder";
  start_date: string;
  end_date: string;
  all_day?: boolean;
  task_id?: string | null;
  client_id?: string | null;
  color?: string | null;
};

export function useCalendarEvents(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["calendar-events", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("calendar_events")
        .select("*, clients(name)")
        .order("start_date", { ascending: true });

      if (startDate) {
        query = query.gte("start_date", startDate);
      }
      if (endDate) {
        query = query.lte("end_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (CalendarEvent & { clients: { name: string } | null })[];
    },
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCalendarEventInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("calendar_events")
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
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Événement ajouté");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Événement mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié - veuillez vous reconnecter");

      console.log("Suppression événement:", id, "pour user:", user.id);

      const { data, error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Erreur DB suppression événement:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Événement introuvable ou accès refusé");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Événement supprimé");
    },
    onError: (error) => {
      console.error("Erreur suppression événement:", error);
      toast.error("Erreur: " + error.message);
    },
  });
}
