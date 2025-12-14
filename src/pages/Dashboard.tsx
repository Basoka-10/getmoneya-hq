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
} from "lucide-react";
import { Link } from "react-router-dom";

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

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Tableau de bord
          </h1>
          <p className="mt-1 text-muted-foreground">
            Comprenez votre situation en moins de 10 secondes.
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

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Solde actuel"
            value={`${mockStats.balance.toLocaleString("fr-FR")} €`}
            change="+12% ce mois"
            changeType="positive"
            icon={Wallet}
            iconColor="primary"
          />
          <StatCard
            title="Revenus totaux"
            value={`${mockStats.totalIncome.toLocaleString("fr-FR")} €`}
            change="+8% vs mois dernier"
            changeType="positive"
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Dépenses totales"
            value={`${mockStats.totalExpenses.toLocaleString("fr-FR")} €`}
            change="-3% vs mois dernier"
            changeType="positive"
            icon={TrendingDown}
            iconColor="warning"
          />
          <StatCard
            title="Clients actifs"
            value={mockStats.activeClients.toString()}
            change="2 prospects à relancer"
            changeType="neutral"
            icon={Users}
            iconColor="primary"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Financial Health */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Santé financière
            </h2>
            <FinancialHealth percentageSpent={mockStats.percentageSpent} />
          </div>

          {/* Tasks of the day */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card lg:col-span-2">
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
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
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
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
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
