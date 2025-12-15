import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Trash2,
  Loader2,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { GuideTooltip } from "@/components/onboarding/GuideTooltip";
import { FilterPopover, FilterState, PeriodFilter } from "@/components/finances/FilterPopover";
import { exportToCSV, filterTransactionsByPeriod } from "@/utils/csvExport";
import { toast } from "sonner";

const Finances = () => {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    period: "all",
    type: "all",
    category: "all",
  });

  const { data: incomes = [], isLoading: loadingIncomes } = useTransactions("income");
  const { data: expenses = [], isLoading: loadingExpenses } = useTransactions("expense");
  const { data: savings = [], isLoading: loadingSavings } = useTransactions("savings");
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

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    [...incomes, ...expenses, ...savings].forEach((tx) => {
      if (tx.category) categories.add(tx.category);
    });
    return Array.from(categories).sort();
  }, [incomes, expenses, savings]);

  // Apply filters to transactions
  const filteredIncomes = useMemo(() => {
    let filtered = incomes;
    if (filters.type !== "all" && filters.type !== "income") return [];
    filtered = filterTransactionsByPeriod(filtered, filters.period as PeriodFilter);
    if (filters.category !== "all") {
      filtered = filtered.filter((tx) => tx.category === filters.category);
    }
    return filtered;
  }, [incomes, filters]);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
    if (filters.type !== "all" && filters.type !== "expense") return [];
    filtered = filterTransactionsByPeriod(filtered, filters.period as PeriodFilter);
    if (filters.category !== "all") {
      filtered = filtered.filter((tx) => tx.category === filters.category);
    }
    return filtered;
  }, [expenses, filters]);

  const filteredSavings = useMemo(() => {
    let filtered = savings;
    if (filters.type !== "all" && filters.type !== "savings") return [];
    filtered = filterTransactionsByPeriod(filtered, filters.period as PeriodFilter);
    if (filters.category !== "all") {
      filtered = filtered.filter((tx) => tx.category === filters.category);
    }
    return filtered;
  }, [savings, filters]);

  // Export handler
  const handleExport = () => {
    const allFiltered = [
      ...filteredIncomes.map((tx) => ({ ...tx, type: "income" as const })),
      ...filteredExpenses.map((tx) => ({ ...tx, type: "expense" as const })),
      ...filteredSavings.map((tx) => ({ ...tx, type: "savings" as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (allFiltered.length === 0) {
      toast.error("Aucune transaction à exporter");
      return;
    }

    exportToCSV({
      transactions: allFiltered,
      currencyCode: currencyConfig.code,
      currencySymbol: currencyConfig.symbol,
      filename: "moneya_transactions",
    });

    toast.success(`${allFiltered.length} transaction(s) exportée(s)`);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Finances</h1>
            <p className="mt-1 text-muted-foreground">
              Suivez vos revenus, dépenses et épargnes.
            </p>
          </div>
          <div className="flex gap-2">
            <GuideTooltip content="Filtrez vos transactions par période, type ou catégorie.">
              <FilterPopover
                filters={filters}
                onFiltersChange={setFilters}
                categories={allCategories}
              />
            </GuideTooltip>
            <GuideTooltip content="Exportez les transactions filtrées au format CSV.">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
            </GuideTooltip>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="income" className="gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Revenus ({filteredIncomes.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Dépenses ({filteredExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="savings" className="gap-2">
              <PiggyBank className="h-4 w-4" />
              Épargne ({filteredSavings.length})
            </TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="flex justify-end">
              <GuideTooltip content="Cliquez ici pour enregistrer un nouveau revenu (paiement client, vente, etc.)">
                <Button size="sm" onClick={() => setShowIncomeModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un revenu
                </Button>
              </GuideTooltip>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="w-full overflow-x-auto moneya-scrollbar">
              {loadingIncomes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredIncomes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowDownLeft className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {incomes.length === 0 ? "Aucun revenu enregistré" : "Aucun revenu correspondant aux filtres"}
                  </p>
                  {incomes.length === 0 && (
                    <Button variant="outline" className="mt-4" onClick={() => setShowIncomeModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter votre premier revenu
                    </Button>
                  )}
                </div>
              ) : (
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Montant
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredIncomes.map((income) => (
                      <tr
                        key={income.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                              <ArrowDownLeft className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {income.description}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {income.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(income.date)}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-right text-sm font-semibold text-success">
                          +{formatCurrency(Number(income.amount))}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-right">
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
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-end">
              <GuideTooltip content="Cliquez ici pour enregistrer une nouvelle dépense (achat, abonnement, etc.)">
                <Button size="sm" onClick={() => setShowExpenseModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une dépense
                </Button>
              </GuideTooltip>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="w-full overflow-x-auto moneya-scrollbar">
              {loadingExpenses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowUpRight className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {expenses.length === 0 ? "Aucune dépense enregistrée" : "Aucune dépense correspondant aux filtres"}
                  </p>
                  {expenses.length === 0 && (
                    <Button variant="outline" className="mt-4" onClick={() => setShowExpenseModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter votre première dépense
                    </Button>
                  )}
                </div>
              ) : (
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Montant
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {expense.description}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {expense.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(expense.date)}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-right text-sm font-semibold text-destructive">
                          -{formatCurrency(Number(expense.amount))}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-right">
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
            </div>
          </TabsContent>

          {/* Savings Tab */}
          <TabsContent value="savings" className="space-y-4">
            <div className="flex justify-end">
              <GuideTooltip content="Cliquez ici pour enregistrer une épargne (économies, investissement, etc.)">
                <Button size="sm" onClick={() => setShowSavingsModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une épargne
                </Button>
              </GuideTooltip>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="w-full overflow-x-auto moneya-scrollbar">
              {loadingSavings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSavings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PiggyBank className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {savings.length === 0 ? "Aucune épargne enregistrée" : "Aucune épargne correspondant aux filtres"}
                  </p>
                  {savings.length === 0 && (
                    <>
                      <p className="text-sm text-muted-foreground/70 mt-2 max-w-md">
                        L'épargne vous permet de mettre de côté de l'argent pour vos projets futurs, urgences ou investissements.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowSavingsModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter votre première épargne
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Montant
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSavings.map((saving) => (
                      <tr
                        key={saving.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <PiggyBank className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {saving.description}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {saving.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(saving.date)}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-right text-sm font-semibold text-primary">
                          {formatCurrency(Number(saving.amount))}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteTransaction.mutate(saving.id)}
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <TransactionModal
        type="income"
        open={showIncomeModal}
        onOpenChange={setShowIncomeModal}
      />
      <TransactionModal
        type="expense"
        open={showExpenseModal}
        onOpenChange={setShowExpenseModal}
      />
      <TransactionModal
        type="savings"
        open={showSavingsModal}
        onOpenChange={setShowSavingsModal}
      />
    </AppLayout>
  );
};

export default Finances;
