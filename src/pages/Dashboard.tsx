import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { TaskList } from "@/components/dashboard/TaskList";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ClientsOverview } from "@/components/dashboard/ClientsOverview";
import { FinancialHealth } from "@/components/dashboard/FinancialHealth";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowRight,
  Star,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Demo data - from document content
const mockStats = {
  balance: 12450,
  totalIncome: 28500,
  totalExpenses: 16050,
  percentageSpent: 56,
  activeClients: 8,
};

const mockTasks = [
  { id: "1", title: "Finaliser proposition client ABC", time: "09:00", completed: false, client: "ABC Corp" },
  { id: "2", title: "Appel de suivi - Projet Beta", time: "11:00", completed: false, client: "Beta Inc" },
  { id: "3", title: "Envoyer facture mensuelle", time: "14:00", completed: true },
  { id: "4", title: "Réviser contrat de service", time: "16:00", completed: false, client: "Startup X" },
];

const mockTransactions = [
  { id: "1", description: "Paiement client ABC", amount: 3500, type: "income" as const, date: "14 déc.", category: "Service" },
  { id: "2", description: "Abonnement logiciel", amount: 49, type: "expense" as const, date: "13 déc.", category: "Outils" },
  { id: "3", description: "Consultation Beta Inc", amount: 1200, type: "income" as const, date: "12 déc.", category: "Conseil" },
  { id: "4", description: "Frais bancaires", amount: 25, type: "expense" as const, date: "10 déc.", category: "Banque" },
];

const mockClients = [
  { id: "1", name: "ABC Corp", status: "active" as const, revenue: 8500 },
  { id: "2", name: "Beta Inc", status: "active" as const, revenue: 5200 },
  { id: "3", name: "Startup X", status: "prospect" as const, revenue: 0 },
  { id: "4", name: "Delta SA", status: "former" as const, revenue: 3200 },
];

// Mock recent agent/activity
const recentActivity = {
  name: "Projet Alpha",
  date: "14 déc. 2025",
  status: "En cours",
  description: "Développement de la nouvelle fonctionnalité de facturation...",
};

const Dashboard = () => {
  const userName = "Utilisateur";
  
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-foreground">
            De retour parmi nous <span className="text-primary">{userName}</span>, 👋
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            qu'est-ce que nous créons aujourd'hui ?
          </p>
        </div>

        {/* Alert - if threshold reached */}
        {mockStats.percentageSpent >= 70 && (
          <AlertBanner
            type="warning"
            message="Vous avez dépensé 70% de votre capital."
            description="Vous devez générer des revenus pour équilibrer vos finances."
          />
        )}

        {/* Top Stats - Two Column Like Reference */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Total Stats */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Wallet className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Solde actuel</p>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-5xl font-bold tracking-tight text-card-foreground">
                {mockStats.balance.toLocaleString("fr-FR")}
                <span className="text-2xl ml-1">€</span>
              </p>
              <div className="flex items-center gap-2 text-primary text-sm">
                <Clock className="h-4 w-4" />
                <span>En ligne: {mockStats.activeClients}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Star className="h-5 w-5 text-warning" />
              <p className="text-sm font-medium">Activité récente</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">{recentActivity.name}</h3>
                <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                  {recentActivity.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{recentActivity.date}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recentActivity.description}
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Analyse financière
            <span className="text-muted-foreground text-sm font-normal ml-2">
              (Données d'exemple)
            </span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenus totaux"
            value={mockStats.totalIncome.toLocaleString("fr-FR") + " €"}
            change="+8%"
            changeType="positive"
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Dépenses totales"
            value={mockStats.totalExpenses.toLocaleString("fr-FR") + " €"}
            change="-3%"
            changeType="positive"
            icon={TrendingDown}
            iconColor="warning"
          />
          <StatCard
            title="Clients actifs"
            value={mockStats.activeClients.toString()}
            subtitle="2 prospects"
            icon={Users}
            iconColor="primary"
          />
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Évolution</span>
              <Link
                to="/analysis"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-card-foreground">0</span>
              <span className="text-sm text-muted-foreground">7 derniers jours</span>
              <Badge className="ml-auto bg-primary/20 text-primary border-0">
                ↗ 0.00%
              </Badge>
            </div>
            {/* Mini chart placeholder */}
            <div className="mt-4 h-16 flex items-end justify-center">
              <p className="text-sm text-muted-foreground">Pas encore de données</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Financial Health */}
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Santé financière
            </h2>
            <FinancialHealth percentageSpent={mockStats.percentageSpent} />
          </div>

          {/* Tasks of the day */}
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">
                Tâches du jour
              </h2>
              <Link
                to="/tasks"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <TaskList tasks={mockTasks} />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">
                Transactions récentes
              </h2>
              <Link
                to="/finances"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <RecentTransactions transactions={mockTransactions} />
          </div>

          {/* Clients Overview */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">
                Clients
              </h2>
              <Link
                to="/clients"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ClientsOverview clients={mockClients} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;