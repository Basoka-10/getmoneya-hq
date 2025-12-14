import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
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

// Mock data for charts - based on document
const monthlyData = [
  { name: "Jan", revenus: 4200, depenses: 2800 },
  { name: "Fév", revenus: 3800, depenses: 3200 },
  { name: "Mar", revenus: 5100, depenses: 2900 },
  { name: "Avr", revenus: 4700, depenses: 3100 },
  { name: "Mai", revenus: 5500, depenses: 2700 },
  { name: "Juin", revenus: 6200, depenses: 3400 },
  { name: "Juil", revenus: 5800, depenses: 3800 },
  { name: "Août", revenus: 4900, depenses: 2600 },
  { name: "Sept", revenus: 6800, depenses: 3200 },
  { name: "Oct", revenus: 7200, depenses: 3500 },
  { name: "Nov", revenus: 6500, depenses: 3100 },
  { name: "Déc", revenus: 7800, depenses: 3600 },
];

const categoryData = [
  { name: "Outils", montant: 580 },
  { name: "Infrastructure", montant: 920 },
  { name: "Formation", montant: 450 },
  { name: "Marketing", montant: 380 },
  { name: "Banque", montant: 240 },
];

const Analysis = () => {
  const avgIncome = Math.round(
    monthlyData.reduce((acc, d) => acc + d.revenus, 0) / 12
  );
  const avgExpenses = Math.round(
    monthlyData.reduce((acc, d) => acc + d.depenses, 0) / 12
  );
  const bestMonth = monthlyData.reduce((prev, current) =>
    prev.revenus > current.revenus ? prev : current
  );
  const worstMonth = monthlyData.reduce((prev, current) =>
    prev.revenus - prev.depenses < current.revenus - current.depenses
      ? prev
      : current
  );

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
            value={`${avgIncome.toLocaleString("fr-FR")} €`}
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Moyenne dépenses/mois"
            value={`${avgExpenses.toLocaleString("fr-FR")} €`}
            icon={TrendingDown}
            iconColor="warning"
          />
          <StatCard
            title="Mois le plus rentable"
            value={bestMonth.name}
            change={`${bestMonth.revenus.toLocaleString("fr-FR")} € de revenus`}
            changeType="positive"
            icon={CalendarDays}
            iconColor="success"
          />
          <StatCard
            title="Mois à risque"
            value={worstMonth.name}
            change="Marge la plus faible"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="destructive"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Evolution Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-6 text-lg font-semibold text-card-foreground">
              Évolution des revenus
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(142, 71%, 45%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(142, 71%, 45%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 13%, 91%)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString("fr-FR")} €`,
                      "Revenus",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenus"
                    stroke="hsl(142, 71%, 45%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenu)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses Evolution Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-6 text-lg font-semibold text-card-foreground">
              Évolution des dépenses
            </h2>
            <div className="h-72">
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
                        stopColor="hsl(38, 92%, 50%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(38, 92%, 50%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 13%, 91%)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString("fr-FR")} €`,
                      "Dépenses",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="depenses"
                    stroke="hsl(38, 92%, 50%)"
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-6 text-lg font-semibold text-card-foreground">
            Répartition des dépenses par catégorie
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 13%, 91%)"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
                  axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                  tickFormatter={(value) => `${value} €`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
                  axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 91%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString("fr-FR")} €`,
                    "Montant",
                  ]}
                />
                <Bar
                  dataKey="montant"
                  fill="hsl(168, 76%, 36%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analysis;
