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
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useTransactions, useDeleteTransaction, Transaction } from "@/hooks/useTransactions";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { EditTransactionModal } from "@/components/modals/EditTransactionModal";
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    period: "all",
    type: "all",
    category: "all",
  });

  const { data: incomes = [], isLoading: loadingIncomes } = useTransactions("income");
  const { data: expenses = [], isLoading: loadingExpenses } = useTransactions("expense");
  const { data: savings = [], isLoading: loadingSavings } = useTransactions("savings");
  const deleteTransaction = useDeleteTransaction();
  const { currencyConfig, convertAndFormat } = useCurrency();

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy", { locale: fr });
  };

  // Format with currency conversion
  const formatCurrency = (amount: number, currencyCode: string | null) => {
    return convertAndFormat(amount, currencyCode);
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

  // Render transaction row with edit button
  const renderTransactionRow = (
    transaction: Transaction,
    icon: React.ReactNode,
    iconBgClass: string,
    amountColorClass: string,
    amountPrefix: string = ""
  ) => (
    <tr
      key={transaction.id}
      className="transition-colors hover:bg-muted/30"
    >
      <td className="px-3 sm:px-6 py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn("flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg shrink-0", iconBgClass)}>
            {icon}
          </div>
          <span className="text-sm font-medium text-foreground line-clamp-2 sm:line-clamp-1">
            {transaction.description}
          </span>
        </div>
      </td>
      <td className="hidden sm:table-cell whitespace-nowrap px-4 sm:px-6 py-4">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {transaction.category}
        </span>
      </td>
      <td className="hidden md:table-cell whitespace-nowrap px-4 sm:px-6 py-4 text-sm text-muted-foreground">
        {formatDate(transaction.date)}
      </td>
      <td className={cn("whitespace-nowrap px-3 sm:px-6 py-4 text-right text-sm font-semibold", amountColorClass)}>
        {amountPrefix}{formatCurrency(Number(transaction.amount), transaction.currency_code)}
      </td>
      <td className="whitespace-nowrap px-2 sm:px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditingTransaction(transaction)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => deleteTransaction.mutate(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

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
            <TabsTrigger value="income" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Revenus</span>
              <span className="xs:hidden">Rev.</span>
              ({filteredIncomes.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Dépenses</span>
              <span className="xs:hidden">Dép.</span>
              ({filteredExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="savings" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Épargne</span>
              <span className="xs:hidden">Ép.</span>
              ({filteredSavings.length})
            </TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="flex justify-end">
              <GuideTooltip content="Cliquez ici pour enregistrer un nouveau revenu (paiement client, vente, etc.)">
                <Button size="sm" onClick={() => setShowIncomeModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter un revenu</span>
                  <span className="sm:hidden">Ajouter</span>
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
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
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
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Description
                      </th>
                      <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Montant
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredIncomes.map((income) =>
                      renderTransactionRow(
                        income,
                        <ArrowDownLeft className="h-4 w-4" />,
                        "bg-success/10 text-success",
                        "text-success",
                        "+"
                      )
                    )}
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
                  <span className="hidden sm:inline">Ajouter une dépense</span>
                  <span className="sm:hidden">Ajouter</span>
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
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
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
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Description
                      </th>
                      <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Montant
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredExpenses.map((expense) =>
                      renderTransactionRow(
                        expense,
                        <ArrowUpRight className="h-4 w-4" />,
                        "bg-destructive/10 text-destructive",
                        "text-destructive",
                        "-"
                      )
                    )}
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
                  <span className="hidden sm:inline">Ajouter une épargne</span>
                  <span className="sm:hidden">Ajouter</span>
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
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
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
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Description
                      </th>
                      <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Montant
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSavings.map((saving) =>
                      renderTransactionRow(
                        saving,
                        <PiggyBank className="h-4 w-4" />,
                        "bg-primary/10 text-primary",
                        "text-primary"
                      )
                    )}
                  </tbody>
                </table>
              )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction Modals */}
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
        <TransactionModal
          open={showSavingsModal}
          onOpenChange={setShowSavingsModal}
          type="savings"
        />
        <EditTransactionModal
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => {
            if (!open) setEditingTransaction(null);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default Finances;