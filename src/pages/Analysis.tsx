import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

const Analysis = () => {
  const { data: transactions = [] } = useTransactions();
  const { formatAmount, currencyConfig, convertAmount } = useCurrency();

  const formatCurrency = (amount: number) => {
    const formatted = formatAmount(amount);
    if (currencyConfig.code === "USD") {
      return `${currencyConfig.symbol}${formatted}`;
    }
    return `${formatted} ${currencyConfig.symbol}`;
  };

  // Calculate monthly data from real transactions with currency conversion
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const data = MONTHS.map((name, index) => ({
      name,
      revenus: 0,
      depenses: 0,
    }));

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        // Convert amount from original currency to display currency
        const convertedAmount = convertAmount(Number(t.amount), t.currency_code);
        if (t.type === "income") {
          data[monthIndex].revenus += convertedAmount;
        } else if (t.type === "expense") {
          data[monthIndex].depenses += convertedAmount;
        }
      }
    });

    return data;
  }, [transactions, convertAmount]);

  // Calculate category data from real expenses with currency conversion
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const convertedAmount = convertAmount(Number(t.amount), t.currency_code);
        categories[t.category] = (categories[t.category] || 0) + convertedAmount;
      });

    return Object.entries(categories)
      .map(([name, montant]) => ({ name, montant }))
      .sort((a, b) => b.montant - a.montant);
  }, [transactions, convertAmount]);

  const totalRevenue = monthlyData.reduce((acc, d) => acc + d.revenus, 0);
  const totalExpenses = monthlyData.reduce((acc, d) => acc + d.depenses, 0);
  const monthsWithData = monthlyData.filter((d) => d.revenus > 0 || d.depenses > 0).length || 1;

  const avgIncome = Math.round(totalRevenue / monthsWithData);
  const avgExpenses = Math.round(totalExpenses / monthsWithData);

  const bestMonth = monthlyData.reduce((prev, current) =>
    prev.revenus > current.revenus ? prev : current
  );
  const worstMonth = monthlyData.reduce((prev, current) => {
    const prevMargin = prev.revenus - prev.depenses;
    const currentMargin = current.revenus - current.depenses;
    return prevMargin < currentMargin ? prev : current;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analyse</h1>
          <p className="mt-1 text-muted-foreground">
            Analyses simples pour prendre de meilleures décisions.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Moyenne revenus/mois"
            value={formatCurrency(avgIncome)}
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Moyenne dépenses/mois"
            value={formatCurrency(avgExpenses)}
            icon={TrendingDown}
            iconColor="warning"
          />
          <StatCard
            title="Mois le plus rentable"
            value={bestMonth.revenus > 0 ? bestMonth.name : "-"}
            change={bestMonth.revenus > 0 ? `${formatCurrency(bestMonth.revenus)} de revenus` : "Aucune donnée"}
            changeType={bestMonth.revenus > 0 ? "positive" : "neutral"}
            icon={CalendarDays}
            iconColor="success"
          />
          <StatCard
            title="Mois à risque"
            value={worstMonth.depenses > 0 ? worstMonth.name : "-"}
            change={worstMonth.depenses > 0 ? "Marge la plus faible" : "Aucune donnée"}
            changeType={worstMonth.depenses > 0 ? "negative" : "neutral"}
            icon={AlertTriangle}
            iconColor="destructive"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          {/* Revenue Evolution Chart */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
            <h2 className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-card-foreground">
              Évolution des revenus
            </h2>
            <div className="h-56 sm:h-72 -ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenus",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenus"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenu)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses Evolution Chart */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
            <h2 className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-card-foreground">
              Évolution des dépenses
            </h2>
            <div className="h-56 sm:h-72 -ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorDepenses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--warning))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--warning))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Dépenses",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="depenses"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDepenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
          <h2 className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-card-foreground">
            Répartition des dépenses par catégorie
          </h2>
          <div className="h-48 sm:h-64 overflow-x-auto moneya-scrollbar">
            {categoryData.length > 0 ? (
              <div className="min-w-[300px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : `${value}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--card-foreground))",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Montant",
                      ]}
                    />
                    <Bar
                      dataKey="montant"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Aucune dépense enregistrée
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analysis;