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
  const { currencyConfig } = useCurrency();
  const { incomeCategories, expenseCategories } = useCategories();

  const categories = type === "income" 
    ? incomeCategories 
    : type === "expense" 
      ? expenseCategories 
      : SAVINGS_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputAmount = parseFloat(amount);
    // Store amount directly in user's native currency - NO CONVERSION
    await createTransaction.mutateAsync({
      type,
      description,
      amount: inputAmount,
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
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base">
            {type === "income" ? "Ajouter un revenu" : type === "expense" ? "Ajouter une dépense" : "Ajouter une épargne"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "income" ? "Ex: Paiement client ABC" : type === "expense" ? "Ex: Abonnement logiciel" : "Ex: Épargne mensuelle"}
              required
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-sm">Montant ({currencyConfig.symbol})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-sm">Catégorie</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="h-9">
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

          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-sm">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-9"
            />
          </div>

          {type === "income" && clients && clients.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="client" className="text-sm">Client (optionnel)</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-9">
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

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" size="sm" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
