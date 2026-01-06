import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvoice, useUpdateInvoice, Invoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/contexts/CurrencyContext";
import { QuickClientModal } from "./QuickClientModal";
import { format, addDays } from "date-fns";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  prefillData?: {
    clientId?: string;
    items?: LineItem[];
    notes?: string;
    category?: string;
  };
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const TVA_RATES = [
  { value: 0, label: "0%" },
  { value: 5, label: "5%" },
  { value: 10, label: "10%" },
  { value: 18, label: "18%" },
  { value: 20, label: "20%" },
];

export function InvoiceModal({ open, onOpenChange, invoice, prefillData }: InvoiceModalProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const defaultDueDate = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const { currency, currencyConfig } = useCurrency();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [tvaRate, setTvaRate] = useState(0);
  const [category, setCategory] = useState("Ventes");
  const [showQuickClient, setShowQuickClient] = useState(false);

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { data: clients } = useClients();
  const { incomeCategories } = useCategories();

  const isEditing = !!invoice;

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

  // Reset form when modal opens - documents are already in active currency
  useEffect(() => {
    if (open) {
      if (invoice) {
        setInvoiceNumber(invoice.invoice_number);
        setClientId(invoice.client_id || "");
        setIssueDate(invoice.issue_date);
        setDueDate(invoice.due_date);
        setNotes(invoice.notes || "");
        setCategory(invoice.category || "Ventes");
        const parsedItems = parseItems(invoice.items);
        const safeItems = parsedItems.length ? parsedItems : [{ description: "", quantity: 1, unit_price: 0 }];
        setItems(
          safeItems.map((it) => ({
            ...it,
            unit_price: Number(it.unit_price) || 0,
          }))
        );
      } else if (prefillData) {
        setInvoiceNumber(`F-${format(new Date(), "yyyy")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`);
        setClientId(prefillData.clientId || "");
        const prefillItems = prefillData.items || [{ description: "", quantity: 1, unit_price: 0 }];
        setItems(prefillItems.map((it) => ({ ...it, unit_price: Number(it.unit_price) || 0 })));
        setNotes(prefillData.notes || "");
        setCategory(prefillData.category || "Ventes");
        setIssueDate(today);
        setDueDate(defaultDueDate);
      } else {
        setInvoiceNumber(`F-${format(new Date(), "yyyy")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`);
        setClientId("");
        setItems([{ description: "", quantity: 1, unit_price: 0 }]);
        setNotes("");
        setCategory("Ventes");
        setIssueDate(today);
        setDueDate(defaultDueDate);
      }
    }
  }, [open, invoice, prefillData, today, defaultDueDate]);

  const subtotalHT = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const tvaAmount = subtotalHT * (tvaRate / 100);
  const totalTTC = subtotalHT + tvaAmount;

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

    const itemsToSave = items
      .filter((item) => item.description.trim() && (Number(item.quantity) > 0 || Number(item.unit_price) > 0))
      .map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
      }));

    const subtotal = itemsToSave.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const tva = subtotal * (tvaRate / 100);
    const totalAmount = subtotal + tva;

    if (itemsToSave.length === 0 || totalAmount <= 0) {
      toast.error("Veuillez ajouter au moins un article avec un prix valide");
      return;
    }

    if (isEditing && invoice) {
      await updateInvoice.mutateAsync({
        id: invoice.id,
        invoice_number: invoiceNumber,
        client_id: clientId || null,
        amount: totalAmount,
        issue_date: issueDate,
        due_date: dueDate,
        items: itemsToSave,
        notes: notes ? `TVA: ${tvaRate}%\n${notes}` : `TVA: ${tvaRate}%`,
        currency_code: currency,
        category,
      });
    } else {
      await createInvoice.mutateAsync({
        invoice_number: invoiceNumber,
        client_id: clientId || null,
        amount: totalAmount,
        issue_date: issueDate,
        due_date: dueDate,
        items: itemsToSave,
        notes: notes ? `TVA: ${tvaRate}%\n${notes}` : `TVA: ${tvaRate}%`,
        currency_code: currency,
        category,
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
            <DialogTitle className="text-foreground">
              {isEditing ? "Modifier la facture" : prefillData ? "Créer la facture depuis le devis" : "Nouvelle facture"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Numéro de facture *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
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
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie de revenu</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cette catégorie sera utilisée pour enregistrer le revenu quand la facture sera payée
              </p>
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
                      step={currencyConfig.decimals === 0 ? "1" : "0.01"}
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

              <div className="space-y-1 text-right text-sm">
                <div className="text-muted-foreground">
                  Sous-total HT: {formatSelectedMoney(subtotalHT)}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-muted-foreground">TVA:</span>
                  <Select value={tvaRate.toString()} onValueChange={(v) => setTvaRate(Number(v))}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TVA_RATES.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value.toString()}>
                          {rate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">{formatSelectedMoney(tvaAmount)}</span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  Total TTC: {formatSelectedMoney(totalTTC)}
                </div>
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
              <Button type="submit" disabled={createInvoice.isPending || updateInvoice.isPending}>
                {createInvoice.isPending || updateInvoice.isPending 
                  ? (isEditing ? "Mise à jour..." : "Création...") 
                  : (isEditing ? "Enregistrer" : "Créer la facture")}
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
