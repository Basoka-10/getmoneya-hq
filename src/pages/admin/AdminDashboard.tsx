import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeAdminStats } from "@/hooks/useRealtimeAdminStats";
import { Users, FileText, Receipt, RefreshCw, Clock, Building2, Star, Crown, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Vue d'ensemble en temps réel de la plateforme MONEYA
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 sm:h-10 w-24" />
              ) : (
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
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

      {/* Users by Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Utilisateurs par plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 sm:h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50">
                <div className="p-2 sm:p-3 rounded-full bg-gray-500/10">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Plan Gratuit</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.usersByPlan.free}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50">
                <div className="p-2 sm:p-3 rounded-full bg-amber-500/10">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Plan Pro</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.usersByPlan.pro}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50">
                <div className="p-2 sm:p-3 rounded-full bg-purple-500/10">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Plan Business</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.usersByPlan.business}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Users - Mobile optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
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
            <div className="space-y-3">
              {latestUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {user.full_name || "Non renseigné"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{user.company_name || "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {format(new Date(user.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                    </span>
                    <span className="sm:hidden">
                      {format(new Date(user.created_at), "dd/MM HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Quotations - Mobile optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
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
            <div className="space-y-3">
              {latestQuotations.map((quotation) => (
                <div key={quotation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-medium text-sm">
                        {quotation.quotation_number}
                      </span>
                      <Badge className={`${statusColors[quotation.status]} text-white text-xs`}>
                        {statusLabels[quotation.status] || quotation.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {quotation.client_name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm">{formatAmount(quotation.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(quotation.created_at), "dd/MM/yy", { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Invoices - Mobile optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
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
            <div className="space-y-3">
              {latestInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-medium text-sm">
                        {invoice.invoice_number}
                      </span>
                      <Badge className={`${statusColors[invoice.status]} text-white text-xs`}>
                        {statusLabels[invoice.status] || invoice.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {invoice.client_name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm">{formatAmount(invoice.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(invoice.created_at), "dd/MM/yy", { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Statut du système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mode</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              PRODUCTION
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Realtime</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Actif
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">API Taux de change</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Actif
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
