import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQuotation, useUpdateQuotation, Quotation } from "@/hooks/useQuotations";
import { useClients } from "@/hooks/useClients";
import { useCurrency } from "@/contexts/CurrencyContext";
import { QuickClientModal } from "./QuickClientModal";
import { format, addDays } from "date-fns";
import { Plus, Trash2, UserPlus } from "lucide-react";

interface QuotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation?: Quotation | null;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export function QuotationModal({ open, onOpenChange, quotation }: QuotationModalProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const defaultValidUntil = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const { currencyConfig } = useCurrency();

  const [quotationNumber, setQuotationNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [showQuickClient, setShowQuickClient] = useState(false);

  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const { data: clients } = useClients();

  const isEditing = !!quotation;

  const formatSelectedMoney = (amountValue: number) => {
    const formatted = amountValue.toLocaleString(currencyConfig.locale, {
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
    });
    if (currencyConfig.code === "USD") return `${currencyConfig.symbol}${formatted}`;
    return `${formatted} ${currencyConfig.symbol}`;
  };


  // Parse items safely - handles both JSON string and array
  const parseItems = (items: unknown): LineItem[] => {
    if (!items) return [];
    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (Array.isArray(items)) return items as LineItem[];
    return [];
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (quotation) {
        setQuotationNumber(quotation.quotation_number);
        setClientId(quotation.client_id || "");
        setIssueDate(quotation.issue_date);
        setValidUntil(quotation.valid_until);
        setNotes(quotation.notes || "");
        const parsedItems = parseItems(quotation.items);
        const safeItems = parsedItems.length ? parsedItems : [{ description: "", quantity: 1, unit_price: 0 }];
        setItems(safeItems.map((it) => ({ ...it, unit_price: Number(it.unit_price) || 0 })));
      } else {
        setQuotationNumber(`D-${format(new Date(), "yyyy")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`);
        setClientId("");
        setItems([{ description: "", quantity: 1, unit_price: 0 }]);
        setNotes("");
        setIssueDate(today);
        setValidUntil(defaultValidUntil);
      }
    }
  }, [open, quotation, today, defaultValidUntil]);

  const totalAmountSelected = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsEur = items
      .filter((item) => item.description)
      .map((item) => ({
        ...item,
        unit_price: toBaseEur(Number(item.unit_price) || 0),
      }));

    const totalAmountEur = itemsEur.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
      0
    );

    if (isEditing && quotation) {
      await updateQuotation.mutateAsync({
        id: quotation.id,
        quotation_number: quotationNumber,
        client_id: clientId || null,
        amount: totalAmount,
        issue_date: issueDate,
        valid_until: validUntil,
        items: itemsToSave,
        notes: notes || null,
      });
    } else {
      await createQuotation.mutateAsync({
        quotation_number: quotationNumber,
        client_id: clientId || null,
        amount: totalAmount,
        issue_date: issueDate,
        valid_until: validUntil,
        items: itemsToSave,
        notes: notes || null,
      });
    }

    onOpenChange(false);
  };

  const handleClientCreated = (newClientId: string) => {
    setClientId(newClientId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{isEditing ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quotationNumber">Numéro de devis *</Label>
                <Input
                  id="quotationNumber"
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <div className="flex gap-2">
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowQuickClient(true)}
                    title="Ajouter un nouveau client"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Date d'émission</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valide jusqu'au</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Articles</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid gap-2 grid-cols-[1fr_80px_100px_40px] items-center">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Prix"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-right text-lg font-semibold text-foreground">
                Total: {formatSelectedMoney(totalAmountSelected)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes ou conditions..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createQuotation.isPending || updateQuotation.isPending}>
                {createQuotation.isPending || updateQuotation.isPending 
                  ? (isEditing ? "Mise à jour..." : "Création...") 
                  : (isEditing ? "Enregistrer" : "Créer le devis")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <QuickClientModal
        open={showQuickClient}
        onOpenChange={setShowQuickClient}
        onClientCreated={handleClientCreated}
      />
    </>
  );
}
