import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeAdminStats } from "@/hooks/useRealtimeAdminStats";
import { Users, FileText, Receipt, RefreshCw, Clock, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/contexts/CurrencyContext";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  sent: "bg-blue-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  cancelled: "bg-gray-400",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-orange-500",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  paid: "Payé",
  overdue: "En retard",
  cancelled: "Annulé",
  accepted: "Accepté",
  rejected: "Refusé",
  expired: "Expiré",
};

export default function AdminDashboard() {
  const { stats, latestUsers, latestQuotations, latestInvoices, isLoading, refetch } =
    useRealtimeAdminStats();
  const { formatAmount } = useCurrency();

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Devis",
      value: stats.totalQuotations,
      icon: FileText,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Factures",
      value: stats.totalInvoices,
      icon: Receipt,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble en temps réel de la plateforme MONEYA
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-4xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Mis à jour en temps réel
              </p>
            </CardContent>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bgColor.replace("/10", "")}`}
            />
          </Card>
        ))}
      </div>

      {/* Latest Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Derniers utilisateurs inscrits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : latestUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun utilisateur inscrit
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || "Non renseigné"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {user.company_name || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(user.created_at), "dd MMM yyyy HH:mm", {
                            locale: fr,
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Quotations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Derniers devis créés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : latestQuotations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun devis créé</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Devis</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-mono font-medium">
                        {quotation.quotation_number}
                      </TableCell>
                      <TableCell>{quotation.client_name}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(quotation.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[quotation.status]} text-white`}
                        >
                          {statusLabels[quotation.status] || quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(quotation.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-purple-500" />
            Dernières factures créées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : latestInvoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune facture créée
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[invoice.status]} text-white`}
                        >
                          {statusLabels[invoice.status] || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Statut du système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mode</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              PRODUCTION
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Realtime</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Actif
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API Taux de change</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Actif
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
