import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateTransaction, Transaction } from "@/hooks/useTransactions";
import { useClients } from "@/hooks/useClients";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCategories } from "@/hooks/useCategories";

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

const SAVINGS_CATEGORIES = ["Urgence", "Investissement", "Projet", "Retraite", "Autre"];

export function EditTransactionModal({ open, onOpenChange, transaction }: EditTransactionModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [clientId, setClientId] = useState<string>("");

  const updateTransaction = useUpdateTransaction();
  const { data: clients } = useClients();
  const { currencyConfig, convertFromEUR, convertToEUR } = useCurrency();
  const { incomeCategories, expenseCategories } = useCategories();

  // Initialize form when transaction changes
  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      // Convert from EUR to user's currency for display
      const displayAmount = convertFromEUR(transaction.amount);
      setAmount(displayAmount.toFixed(2));
      setCategory(transaction.category);
      setDate(transaction.date);
      setClientId(transaction.client_id || "");
    }
  }, [transaction, convertFromEUR]);

  const type = transaction?.type || "income";
  const categories = type === "income" 
    ? incomeCategories 
    : type === "expense" 
      ? expenseCategories 
      : SAVINGS_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const inputAmount = parseFloat(amount);
    // Convert from user's currency to EUR for storage
    const amountEur = convertToEUR(inputAmount);

    await updateTransaction.mutateAsync({
      id: transaction.id,
      description,
      amount: amountEur,
      category,
      date,
      client_id: clientId || null,
    });

    onOpenChange(false);
  };

  const getTitle = () => {
    switch (type) {
      case "income": return "Modifier le revenu";
      case "expense": return "Modifier la dépense";
      case "savings": return "Modifier l'épargne";
      default: return "Modifier la transaction";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amount">Montant ({currencyConfig.symbol})</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {type === "income" && clients && clients.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="edit-client">Client (optionnel)</Label>
              <Select value={clientId || "none"} onValueChange={(val) => setClientId(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateTransaction.isPending}>
              {updateTransaction.isPending ? "Modification..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
