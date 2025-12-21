import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeStats {
  totalUsers: number;
  totalQuotations: number;
  totalInvoices: number;
  usersByPlan: {
    free: number;
    pro: number;
    business: number;
  };
}

interface LatestUser {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
}

interface LatestQuotation {
  id: string;
  quotation_number: string;
  amount: number;
  status: string;
  created_at: string;
  client_name?: string;
}

interface LatestInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  client_name?: string;
}

export function useRealtimeAdminStats() {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<RealtimeStats>({
    totalUsers: 0,
    totalQuotations: 0,
    totalInvoices: 0,
    usersByPlan: {
      free: 0,
      pro: 0,
      business: 0,
    },
  });
  const [latestUsers, setLatestUsers] = useState<LatestUser[]>([]);
  const [latestQuotations, setLatestQuotations] = useState<LatestQuotation[]>([]);
  const [latestInvoices, setLatestInvoices] = useState<LatestInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch counts
      const [usersCount, quotationsCount, invoicesCount, subscriptionsData] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("quotations").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("plan, status"),
      ]);

      // Count users by plan
      const activeSubscriptions = subscriptionsData.data?.filter(s => s.status === 'active') || [];
      const planCounts = {
        free: activeSubscriptions.filter(s => s.plan === 'free').length,
        pro: activeSubscriptions.filter(s => s.plan === 'pro').length,
        business: activeSubscriptions.filter(s => s.plan === 'business').length,
      };

      // Users without subscription are on free plan
      const usersWithSubscription = activeSubscriptions.length;
      const totalUsersCount = usersCount.count || 0;
      planCounts.free = totalUsersCount - planCounts.pro - planCounts.business;

      setStats({
        totalUsers: totalUsersCount,
        totalQuotations: quotationsCount.count || 0,
        totalInvoices: invoicesCount.count || 0,
        usersByPlan: planCounts,
      });

      // Fetch latest users
      const { data: users } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, company_name, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setLatestUsers(users || []);

      // Fetch latest quotations with client names
      const { data: quotations } = await supabase
        .from("quotations")
        .select(`
          id, 
          quotation_number, 
          amount, 
          status, 
          created_at,
          clients(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      setLatestQuotations(
        (quotations || []).map((q: any) => ({
          id: q.id,
          quotation_number: q.quotation_number,
          amount: q.amount,
          status: q.status,
          created_at: q.created_at,
          client_name: q.clients?.name || "Client non défini",
        }))
      );

      // Fetch latest invoices with client names
      const { data: invoices } = await supabase
        .from("invoices")
        .select(`
          id, 
          invoice_number, 
          amount, 
          status, 
          created_at,
          clients(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      setLatestInvoices(
        (invoices || []).map((i: any) => ({
          id: i.id,
          invoice_number: i.invoice_number,
          amount: i.amount,
          status: i.status,
          created_at: i.created_at,
          client_name: i.clients?.name || "Client non défini",
        }))
      );
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Subscribe to realtime changes on profiles (new users)
    const profilesChannel = supabase
      .channel("admin-profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        async (payload) => {
          console.log("New user registered:", payload);
          // Update count
          setStats((prev) => ({
            ...prev,
            totalUsers: prev.totalUsers + 1,
          }));
          // Add to latest users list
          const newUser = payload.new as LatestUser;
          setLatestUsers((prev) => [newUser, ...prev.slice(0, 9)]);
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          queryClient.invalidateQueries({ queryKey: ["global-stats"] });
        }
      )
      .subscribe();

    // Subscribe to realtime changes on quotations
    const quotationsChannel = supabase
      .channel("admin-quotations-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quotations",
        },
        async (payload) => {
          console.log("New quotation created:", payload);
          // Update count
          setStats((prev) => ({
            ...prev,
            totalQuotations: prev.totalQuotations + 1,
          }));
          // Fetch the client name for the new quotation
          const newQuotation = payload.new as any;
          let clientName = "Client non défini";
          if (newQuotation.client_id) {
            const { data: client } = await supabase
              .from("clients")
              .select("name")
              .eq("id", newQuotation.client_id)
              .single();
            clientName = client?.name || "Client non défini";
          }
          // Add to latest quotations list
          setLatestQuotations((prev) => [
            {
              id: newQuotation.id,
              quotation_number: newQuotation.quotation_number,
              amount: newQuotation.amount,
              status: newQuotation.status,
              created_at: newQuotation.created_at,
              client_name: clientName,
            },
            ...prev.slice(0, 9),
          ]);
          queryClient.invalidateQueries({ queryKey: ["global-stats"] });
        }
      )
      .subscribe();

    // Subscribe to realtime changes on invoices
    const invoicesChannel = supabase
      .channel("admin-invoices-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "invoices",
        },
        async (payload) => {
          console.log("New invoice created:", payload);
          // Update count
          setStats((prev) => ({
            ...prev,
            totalInvoices: prev.totalInvoices + 1,
          }));
          // Fetch the client name for the new invoice
          const newInvoice = payload.new as any;
          let clientName = "Client non défini";
          if (newInvoice.client_id) {
            const { data: client } = await supabase
              .from("clients")
              .select("name")
              .eq("id", newInvoice.client_id)
              .single();
            clientName = client?.name || "Client non défini";
          }
          // Add to latest invoices list
          setLatestInvoices((prev) => [
            {
              id: newInvoice.id,
              invoice_number: newInvoice.invoice_number,
              amount: newInvoice.amount,
              status: newInvoice.status,
              created_at: newInvoice.created_at,
              client_name: clientName,
            },
            ...prev.slice(0, 9),
          ]);
          queryClient.invalidateQueries({ queryKey: ["global-stats"] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(quotationsChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [queryClient]);

  return {
    stats,
    latestUsers,
    latestQuotations,
    latestInvoices,
    isLoading,
    refetch: fetchInitialData,
  };
}
