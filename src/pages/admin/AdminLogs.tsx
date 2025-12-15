import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useActivityLogs } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity, UserPlus, UserMinus, Settings, FileText, Receipt, Users } from "lucide-react";

const actionIcons: Record<string, React.ElementType> = {
  user_suspended: UserMinus,
  user_activated: UserPlus,
  settings_updated: Settings,
  invoice_created: Receipt,
  quotation_created: FileText,
  client_created: Users,
};

const actionLabels: Record<string, string> = {
  user_suspended: "Utilisateur suspendu",
  user_activated: "Utilisateur activé",
  settings_updated: "Paramètres modifiés",
  invoice_created: "Facture créée",
  quotation_created: "Devis créé",
  client_created: "Client créé",
};

const actionColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  user_suspended: "destructive",
  user_activated: "default",
  settings_updated: "secondary",
};

export default function AdminLogs() {
  const { data: logs, isLoading } = useActivityLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs d'activité</h1>
        <p className="text-muted-foreground">Historique des actions dans le système</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité récente ({logs?.length || 0} entrées)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : logs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  logs?.map((log) => {
                    const Icon = actionIcons[log.action] || Activity;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={actionColors[log.action] || "outline"}
                            className="gap-1"
                          >
                            <Icon className="h-3 w-3" />
                            {actionLabels[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.profiles?.full_name || "Système"}
                        </TableCell>
                        <TableCell>
                          {log.entity_type ? (
                            <span className="text-muted-foreground">
                              {log.entity_type}
                              {log.entity_id && (
                                <span className="text-xs ml-1">
                                  ({log.entity_id.slice(0, 8)}...)
                                </span>
                              )}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details ? (
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {JSON.stringify(log.details)}
                            </code>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
