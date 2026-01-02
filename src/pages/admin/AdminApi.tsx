import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Activity, Users, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminApi() {
  // Fetch all API keys (admin view)
  const { data: allKeys = [], isLoading: loadingKeys } = useQuery({
    queryKey: ["admin-api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*, profiles!api_keys_user_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch API stats
  const { data: stats } = useQuery({
    queryKey: ["admin-api-stats"],
    queryFn: async () => {
      const { count: totalKeys } = await supabase
        .from("api_keys")
        .select("*", { count: "exact", head: true });

      const { count: totalLogs } = await supabase
        .from("api_logs")
        .select("*", { count: "exact", head: true });

      const { count: salesLogs } = await supabase
        .from("api_logs")
        .select("*", { count: "exact", head: true })
        .eq("endpoint", "/api/v1/sales")
        .eq("status_code", 200);

      return {
        totalKeys: totalKeys || 0,
        totalCalls: totalLogs || 0,
        totalSales: salesLogs || 0,
      };
    },
  });

  // Fetch recent logs
  const { data: recentLogs = [] } = useQuery({
    queryKey: ["admin-api-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const toggleKeyStatus = async (id: string, isActive: boolean) => {
    await supabase.from("api_keys").update({ is_active: isActive }).eq("id", id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6" /> Gestion API
        </h1>
        <p className="text-muted-foreground">Surveillance des clés API et logs globaux</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Clés API totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalKeys || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Appels API totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalCalls || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ventes via API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats?.totalSales || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* All API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les clés API</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingKeys ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Préfixe</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière utilisation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allKeys.map((key: any) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell><code>{key.key_prefix}...</code></TableCell>
                    <TableCell>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Désactivée"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {key.last_used_at ? format(new Date(key.last_used_at), "d MMM HH:mm", { locale: fr }) : "Jamais"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={key.is_active ? "destructive" : "default"}
                        onClick={() => toggleKeyStatus(key.id, !key.is_active)}
                      >
                        {key.is_active ? "Désactiver" : "Activer"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs API récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={log.status_code < 400 ? "default" : "destructive"}>{log.status_code}</Badge>
                  <code>{log.endpoint}</code>
                  {log.source && <span className="text-muted-foreground">({log.source})</span>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.created_at), "d MMM HH:mm:ss", { locale: fr })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
