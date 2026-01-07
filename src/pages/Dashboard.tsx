import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialHealth } from "@/components/dashboard/FinancialHealth";
import { SubscriptionAlert } from "@/components/dashboard/SubscriptionAlert";
import { PeriodFilter, PeriodType, DateRange } from "@/components/dashboard/PeriodFilter";
import { Wallet, TrendingUp, TrendingDown, Users, ArrowRight, Loader2, PiggyBank, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useTransactionStats, useTransactions, useConvertedTransactionStats } from "@/hooks/useTransactions";
import { useClients } from "@/hooks/useClients";
import { useTasks, useToggleTask } from "@/hooks/useTasks";
import { useCurrency } from "@/contexts/CurrencyContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GuideTooltip } from "@/components/onboarding/GuideTooltip";

const HIDE_AMOUNTS_KEY = "moneya_hide_amounts";

const Dashboard = () => {
  const [period, setPeriod] = useState<PeriodType>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  
  const { data: rawStats, isLoading: loadingStats } = useTransactionStats(dateRange);
  const { data: transactions = [] } = useTransactions();
  const { data: clients = [] } = useClients();
  const { data: tasks = [] } = useTasks();
  const toggleTask = useToggleTask();
  const { formatAmount, currencyConfig, convertAmount, convertAndFormat } = useCurrency();

  // Calculate stats with currency conversion
  const stats = useMemo(() => {
    return useConvertedTransactionStats(rawStats, convertAmount);
  }, [rawStats, convertAmount]);

  const [hideAmounts, setHideAmounts] = useState(() => {
    return localStorage.getItem(HIDE_AMOUNTS_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(HIDE_AMOUNTS_KEY, String(hideAmounts));
  }, [hideAmounts]);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayTasks = tasks.filter((t) => t.due_date === today).slice(0, 4);
  const recentTransactions = transactions.slice(0, 4);
  const activeClients = clients.filter((c) => c.status === "active").length;

  const handleToggle = (id: string, completed: boolean) => {
    toggleTask.mutate({ id, completed: !completed });
  };

  const formatCurrency = (amount: number) => {
    if (hideAmounts) return "••••••";
    const formatted = formatAmount(amount);
    if (currencyConfig.code === "USD") {
      return `${currencyConfig.symbol}${formatted}`;
    }
    return `${formatted} ${currencyConfig.symbol}`;
  };

  const formatHiddenAmount = (amount: number) => {
    if (hideAmounts) return "••••";
    return formatAmount(amount);
  };

  // Format transaction with currency conversion
  const formatTransactionAmount = (amount: number, currencyCode: string | null, type: string) => {
    if (hideAmounts) return "••••••";
    const prefix = type === "income" ? "+" : type === "expense" ? "-" : "";
    return prefix + convertAndFormat(amount, currencyCode);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Subscription Alert */}
        <SubscriptionAlert />

        {/* Welcome Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Bienvenue sur <span className="text-primary">MONEYA</span> 👋
              </h1>
              <p className="mt-2 text-muted-foreground text-base md:text-lg">
                Votre tableau de bord financier
              </p>
            </div>
            <GuideTooltip content="Masquez vos montants pour plus de confidentialité lorsque vous êtes en public.">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHideAmounts(!hideAmounts)}
                className="gap-2"
              >
                {hideAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {hideAmounts ? "Afficher" : "Masquer"}
              </Button>
            </GuideTooltip>
          </div>
          
          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Période :</span>
            <PeriodFilter
              period={period}
              dateRange={dateRange}
              onPeriodChange={setPeriod}
              onDateRangeChange={setDateRange}
            />
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GuideTooltip content="Votre solde actuel = Revenus - Dépenses - Épargne. C'est l'argent disponible.">
            <div className="rounded-xl border border-border bg-card p-6 w-full">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Wallet className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Solde actuel</p>
              </div>
              {loadingStats ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-4xl md:text-5xl font-bold tracking-tight text-card-foreground">
                  {formatHiddenAmount(stats.balance)}
                  {!hideAmounts && <span className="text-2xl ml-1">{currencyConfig.symbol}</span>}
                </p>
              )}
            </div>
          </GuideTooltip>
          
          <GuideTooltip content="Total de vos épargnes. Cliquez sur Finances pour gérer vos économies.">
            <div className="rounded-xl border border-border bg-card p-6 w-full">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <PiggyBank className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Épargne totale</p>
              </div>
              {loadingStats ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                  {formatHiddenAmount(stats.totalSavings)}
                  {!hideAmounts && <span className="text-2xl ml-1">{currencyConfig.symbol}</span>}
                </p>
              )}
            </div>
          </GuideTooltip>

          <GuideTooltip content="Nombre de clients avec le statut 'actif'. Gérez vos clients dans la section Clients.">
            <div className="rounded-xl border border-border bg-card p-6 w-full">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Clients actifs</p>
              </div>
              <p className="text-4xl md:text-5xl font-bold tracking-tight text-card-foreground">{activeClients}</p>
            </div>
          </GuideTooltip>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <GuideTooltip content="Somme de tous vos revenus enregistrés.">
            <div className="w-full">
              <StatCard
                title="Revenus totaux"
                value={formatCurrency(stats.totalIncome)}
                icon={TrendingUp}
                iconColor="success"
              />
            </div>
          </GuideTooltip>
          <GuideTooltip content="Somme de toutes vos dépenses enregistrées.">
            <div className="w-full">
              <StatCard
                title="Dépenses totales"
                value={formatCurrency(stats.totalExpenses)}
                icon={TrendingDown}
                iconColor="warning"
              />
            </div>
          </GuideTooltip>
          <GuideTooltip content="Pourcentage de vos revenus dépensés. Moins de 70% = bonne santé financière.">
            <div className="rounded-xl border border-border bg-card p-6 w-full">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Santé financière</h3>
              <FinancialHealth percentageSpent={stats.percentageSpent} />
            </div>
          </GuideTooltip>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
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
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      t.type === "income" ? "bg-success/10 text-success" : 
                      t.type === "expense" ? "bg-destructive/10 text-destructive" : 
                      "bg-primary/10 text-primary"
                    )}>
                      {t.type === "income" ? <ArrowDownLeft className="h-4 w-4" /> : 
                       t.type === "expense" ? <ArrowUpRight className="h-4 w-4" /> : 
                       <PiggyBank className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.date), "d MMM", { locale: fr })}</p>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      t.type === "income" ? "text-success" : 
                      t.type === "expense" ? "text-destructive" : 
                      "text-primary"
                    )}>
                      {formatTransactionAmount(Number(t.amount), t.currency_code, t.type)}
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