import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialHealth } from "@/components/dashboard/FinancialHealth";
import { SubscriptionAlert } from "@/components/dashboard/SubscriptionAlert";
import { PeriodFilter, PeriodType, DateRange } from "@/components/dashboard/PeriodFilter";
import { Wallet, TrendingUp, TrendingDown, Users, ArrowRight, Loader2, PiggyBank, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTransactionStats, useTransactions } from "@/hooks/useTransactions";
import { useClients } from "@/hooks/useClients";
import { useTasks, useToggleTask } from "@/hooks/useTasks";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GuideTooltip } from "@/components/onboarding/GuideTooltip";

const HIDE_AMOUNTS_KEY = "moneya_hide_amounts";

const Dashboard = () => {
  const [period, setPeriod] = useState<PeriodType>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const { t } = useTranslation();
  const { language } = useLanguage();
  const dateLocale = language === 'fr' ? fr : enUS;
  
  const { data: stats, isLoading: loadingStats } = useTransactionStats(dateRange);
  const { data: transactions = [] } = useTransactions();
  const { data: clients = [] } = useClients();
  const { data: tasks = [] } = useTasks();
  const toggleTask = useToggleTask();
  const { formatAmount, currencyConfig } = useCurrency();

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

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in">
        {/* Subscription Alert */}
        <SubscriptionAlert />

        {/* Welcome Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {t('dashboard.welcome')} <span className="text-primary">MONEYA</span> 👋
              </h1>
              <p className="mt-2 text-muted-foreground text-base md:text-lg">
                {t('dashboard.title')}
              </p>
            </div>
            <GuideTooltip content={language === 'fr' ? "Masquez vos montants pour plus de confidentialité lorsque vous êtes en public." : "Hide your amounts for more privacy when in public."}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHideAmounts(!hideAmounts)}
                className="gap-2"
              >
                {hideAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {hideAmounts ? (language === 'fr' ? "Afficher" : "Show") : (language === 'fr' ? "Masquer" : "Hide")}
              </Button>
            </GuideTooltip>
          </div>
          
          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{language === 'fr' ? 'Période' : 'Period'} :</span>
            <PeriodFilter
              period={period}
              dateRange={dateRange}
              onPeriodChange={setPeriod}
              onDateRangeChange={setDateRange}
            />
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GuideTooltip content={language === 'fr' ? "Votre solde actuel = Revenus - Dépenses - Épargne. C'est l'argent disponible." : "Your current balance = Income - Expenses - Savings. This is your available money."}>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-6 w-full">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 sm:mb-3 md:mb-4">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <p className="text-xs sm:text-sm font-medium">{t('dashboard.balance')}</p>
              </div>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-card-foreground">
                  {formatHiddenAmount(stats?.balance || 0)}
                  {!hideAmounts && <span className="text-lg sm:text-xl md:text-2xl ml-1">{currencyConfig.symbol}</span>}
                </p>
              )}
            </div>
          </GuideTooltip>
          
          <GuideTooltip content={language === 'fr' ? "Total de vos épargnes. Cliquez sur Finances pour gérer vos économies." : "Total savings. Click on Finances to manage your savings."}>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-6 w-full">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 sm:mb-3 md:mb-4">
                <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <p className="text-xs sm:text-sm font-medium">{t('dashboard.savings')}</p>
              </div>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary">
                  {formatHiddenAmount(stats?.totalSavings || 0)}
                  {!hideAmounts && <span className="text-lg sm:text-xl md:text-2xl ml-1">{currencyConfig.symbol}</span>}
                </p>
              )}
            </div>
          </GuideTooltip>

          <GuideTooltip content={language === 'fr' ? "Nombre de clients avec le statut 'actif'. Gérez vos clients dans la section Clients." : "Number of clients with 'active' status. Manage your clients in the Clients section."}>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-6 w-full">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 sm:mb-3 md:mb-4">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <p className="text-xs sm:text-sm font-medium">{language === 'fr' ? 'Clients actifs' : 'Active clients'}</p>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-card-foreground">{activeClients}</p>
            </div>
          </GuideTooltip>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <GuideTooltip content={language === 'fr' ? "Somme de tous vos revenus enregistrés." : "Sum of all your recorded income."}>
            <div className="w-full">
              <StatCard
                title={t('dashboard.income')}
                value={formatCurrency(stats?.totalIncome || 0)}
                icon={TrendingUp}
                iconColor="success"
              />
            </div>
          </GuideTooltip>
          <GuideTooltip content={language === 'fr' ? "Somme de toutes vos dépenses enregistrées." : "Sum of all your recorded expenses."}>
            <div className="w-full">
              <StatCard
                title={t('dashboard.expenses')}
                value={formatCurrency(stats?.totalExpenses || 0)}
                icon={TrendingDown}
                iconColor="warning"
              />
            </div>
          </GuideTooltip>
          <GuideTooltip content={language === 'fr' ? "Pourcentage de vos revenus dépensés. Moins de 70% = bonne santé financière." : "Percentage of income spent. Less than 70% = good financial health."}>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-6 w-full">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">{t('dashboard.financialHealth')}</h3>
              <FinancialHealth percentageSpent={stats?.percentageSpent || 0} />
            </div>
          </GuideTooltip>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
          {/* Tasks */}
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-6">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-card-foreground">{t('dashboard.upcomingTasks')}</h2>
              <Link to="/tasks" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.noTasks')}</p>
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
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-6">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-card-foreground">{t('dashboard.recentTransactions')}</h2>
              <Link to="/finances" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.noTransactions')}</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className={cn(
                      "flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg",
                      tx.type === "income" ? "bg-success/10 text-success" : 
                      tx.type === "expense" ? "bg-destructive/10 text-destructive" : 
                      "bg-primary/10 text-primary"
                    )}>
                      {tx.type === "income" ? <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                       tx.type === "expense" ? <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                       <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(tx.date), "d MMM", { locale: dateLocale })}</p>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      tx.type === "income" ? "text-success" : 
                      tx.type === "expense" ? "text-destructive" : 
                      "text-primary"
                    )}>
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatCurrency(Number(tx.amount))}
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