import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Finances = () => {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const { data: incomes = [], isLoading: loadingIncomes } = useTransactions("income");
  const { data: expenses = [], isLoading: loadingExpenses } = useTransactions("expense");
  const deleteTransaction = useDeleteTransaction();
  const { formatAmount, currencyConfig } = useCurrency();

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy", { locale: fr });
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
              <Button size="sm" onClick={() => setShowIncomeModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un revenu
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              {loadingIncomes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : incomes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowDownLeft className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun revenu enregistré</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowIncomeModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter votre premier revenu
                  </Button>
                </div>
              ) : (
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
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {incomes.map((income) => (
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
                              {income.description}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {income.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(income.date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-success">
                          +{formatCurrency(Number(income.amount))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteTransaction.mutate(income.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowExpenseModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une dépense
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              {loadingExpenses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowUpRight className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucune dépense enregistrée</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowExpenseModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter votre première dépense
                  </Button>
                </div>
              ) : (
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
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expenses.map((expense) => (
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
                          {formatDate(expense.date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-destructive">
                          -{formatCurrency(Number(expense.amount))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteTransaction.mutate(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TransactionModal
        open={showIncomeModal}
        onOpenChange={setShowIncomeModal}
        type="income"
      />
      <TransactionModal
        open={showExpenseModal}
        onOpenChange={setShowExpenseModal}
        type="expense"
      />
    </AppLayout>
  );
};

export default Finances;
