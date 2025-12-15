import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalStats } from "@/hooks/useAdmin";
import { Users, FileText, Receipt, ClipboardList, Wallet, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGlobalStats();

  const statCards = [
    { title: "Utilisateurs", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
    { title: "Clients", value: stats?.totalClients || 0, icon: ClipboardList, color: "text-green-500" },
    { title: "Factures", value: stats?.totalInvoices || 0, icon: Receipt, color: "text-purple-500" },
    { title: "Devis", value: stats?.totalQuotations || 0, icon: FileText, color: "text-orange-500" },
    { title: "Transactions", value: stats?.totalTransactions || 0, icon: Wallet, color: "text-cyan-500" },
    { title: "Tâches", value: stats?.totalTasks || 0, icon: CheckSquare, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble du système MONEYA</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statut du système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              BETA GRATUIT
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Paiements</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Désactivés
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API Taux de change</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Actif
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
