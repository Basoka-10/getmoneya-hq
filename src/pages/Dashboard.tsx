import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialHealth } from "@/components/dashboard/FinancialHealth";
import { Wallet, TrendingUp, TrendingDown, Users, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTransactionStats, useTransactions } from "@/hooks/useTransactions";
import { useClients } from "@/hooks/useClients";
import { useTasks, useToggleTask } from "@/hooks/useTasks";
import { useCurrency } from "@/contexts/CurrencyContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const Dashboard = () => {
  const { data: stats, isLoading: loadingStats } = useTransactionStats();
  const { data: transactions = [] } = useTransactions();
  const { data: clients = [] } = useClients();
  const { data: tasks = [] } = useTasks();
  const toggleTask = useToggleTask();
  const { formatAmount, currencyConfig } = useCurrency();

  const today = format(new Date(), "yyyy-MM-dd");
  const todayTasks = tasks.filter((t) => t.due_date === today).slice(0, 4);
  const recentTransactions = transactions.slice(0, 4);
  const activeClients = clients.filter((c) => c.status === "active").length;

  const handleToggle = (id: string, completed: boolean) => {
    toggleTask.mutate({ id, completed: !completed });
  };

  const formatCurrency = (amount: number) => {
    const formatted = formatAmount(amount);
    if (currencyConfig.code === "USD") {
      return `${currencyConfig.symbol}${formatted}`;
    }
    return `${formatted} ${currencyConfig.symbol}`;
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-foreground">
            Bienvenue sur <span className="text-primary">GET MONEYA</span> 👋
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Votre tableau de bord financier
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Wallet className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Solde actuel</p>
            </div>
            {loadingStats ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-5xl font-bold tracking-tight text-card-foreground">
                {formatAmount(stats?.balance || 0)}
                <span className="text-2xl ml-1">{currencyConfig.symbol}</span>
              </p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Clients actifs</p>
            </div>
            <p className="text-5xl font-bold tracking-tight text-card-foreground">{activeClients}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Revenus totaux"
            value={formatCurrency(stats?.totalIncome || 0)}
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Dépenses totales"
            value={formatCurrency(stats?.totalExpenses || 0)}
            icon={TrendingDown}
            iconColor="warning"
          />
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Santé financière</h3>
            <FinancialHealth percentageSpent={stats?.percentageSpent || 0} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tasks */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">Tâches du jour</h2>
              <Link to="/tasks" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucune tâche aujourd'hui</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className={cn("flex items-center gap-3 rounded-lg border border-border p-3", task.completed && "opacity-60")}>
                    <button onClick={() => handleToggle(task.id, task.completed)}>
                      {task.completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <span className={cn("text-sm flex-1", task.completed && "line-through text-muted-foreground")}>{task.title}</span>
                    {task.due_time && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{task.due_time.substring(0, 5)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">Transactions récentes</h2>
              <Link to="/finances" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucune transaction</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", t.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                      {t.type === "income" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.date), "d MMM", { locale: fr })}</p>
                    </div>
                    <span className={cn("text-sm font-semibold", t.type === "income" ? "text-success" : "text-destructive")}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
