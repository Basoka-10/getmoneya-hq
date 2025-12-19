import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useClients } from "@/hooks/useClients";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCategories } from "@/hooks/useCategories";
import { format } from "date-fns";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense" | "savings";
}

const SAVINGS_CATEGORIES = ["Urgence", "Investissement", "Projet", "Retraite", "Autre"];

export function TransactionModal({ open, onOpenChange, type }: TransactionModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [clientId, setClientId] = useState<string>("");

  const createTransaction = useCreateTransaction();
  const { data: clients } = useClients();
  const { currency, currencyConfig, convertToEUR } = useCurrency();
  const { incomeCategories, expenseCategories } = useCategories();

  const categories = type === "income" 
    ? incomeCategories 
    : type === "expense" 
      ? expenseCategories 
      : SAVINGS_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputAmount = parseFloat(amount);
    // Convert from user's currency to EUR for storage
    const amountEur = convertToEUR(inputAmount, currency);

    await createTransaction.mutateAsync({
      type,
      description,
      amount: amountEur,
      category,
      date,
      client_id: clientId || null,
    });

    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setClientId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {type === "income" ? "Ajouter un revenu" : type === "expense" ? "Ajouter une dépense" : "Ajouter une épargne"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "income" ? "Ex: Paiement client ABC" : type === "expense" ? "Ex: Abonnement logiciel" : "Ex: Épargne mensuelle"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant ({currencyConfig.symbol})</Label>
            <Input
              id="amount"
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
            <Label htmlFor="category">Catégorie</Label>
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {type === "income" && clients && clients.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="client">Client (optionnel)</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
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
            <Button type="submit" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
