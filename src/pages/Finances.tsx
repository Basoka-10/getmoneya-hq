import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data from document
const mockIncomes = [
  { id: "1", source: "ABC Corp - Consulting", amount: 3500, date: "14 déc. 2024", type: "Ponctuel" },
  { id: "2", source: "Beta Inc - Projet mensuel", amount: 2500, date: "01 déc. 2024", type: "Récurrent" },
  { id: "3", source: "Startup X - Formation", amount: 1200, date: "28 nov. 2024", type: "Ponctuel" },
  { id: "4", source: "Delta SA - Maintenance", amount: 800, date: "15 nov. 2024", type: "Récurrent" },
];

const mockExpenses = [
  { id: "1", description: "Abonnement logiciel", amount: 49, date: "13 déc. 2024", category: "Outils" },
  { id: "2", description: "Frais bancaires", amount: 25, date: "10 déc. 2024", category: "Banque" },
  { id: "3", description: "Hébergement web", amount: 120, date: "05 déc. 2024", category: "Infrastructure" },
  { id: "4", description: "Formation en ligne", amount: 299, date: "01 déc. 2024", category: "Formation" },
];

const Finances = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Finances</h1>
            <p className="mt-1 text-muted-foreground">
              Suivez vos revenus et dépenses.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="income" className="gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Revenus
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Dépenses
            </TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un revenu
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockIncomes.map((income) => (
                    <tr
                      key={income.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                            <ArrowDownLeft className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {income.source}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            income.type === "Récurrent"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {income.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {income.date}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-success">
                        +{income.amount.toLocaleString("fr-FR")} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une dépense
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {expense.description}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {expense.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {expense.date}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-destructive">
                        -{expense.amount.toLocaleString("fr-FR")} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Finances;
