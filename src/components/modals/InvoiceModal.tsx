import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvoice, useUpdateInvoice, Invoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useCurrency } from "@/contexts/CurrencyContext";
import { QuickClientModal } from "./QuickClientModal";
import { format, addDays } from "date-fns";
import { Plus, Trash2, UserPlus } from "lucide-react";

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  prefillData?: {
    clientId?: string;
    items?: LineItem[];
    notes?: string;
  };
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export function InvoiceModal({ open, onOpenChange, invoice, prefillData }: InvoiceModalProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const defaultDueDate = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const { currency, currencyConfig, convertToEUR, convertFromEUR } = useCurrency();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [showQuickClient, setShowQuickClient] = useState(false);

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { data: clients } = useClients();

  const isEditing = !!invoice;

  const formatSelectedMoney = (amountValue: number) => {
    const formatted = amountValue.toLocaleString(currencyConfig.locale, {
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
    });
    if (currencyConfig.code === "USD") return `${currencyConfig.symbol}${formatted}`;
    return `${formatted} ${currencyConfig.symbol}`;
  };

  // Convert from selected currency to EUR (for storage)
  const toBaseEur = (amountValue: number) => convertToEUR(amountValue, currency);
  // Convert from EUR to selected currency (for display)
  const fromBaseEur = (amountValue: number) => convertFromEUR(amountValue);

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
      if (invoice) {
        setInvoiceNumber(invoice.invoice_number);
        setClientId(invoice.client_id || "");
        setIssueDate(invoice.issue_date);
        setDueDate(invoice.due_date);
        setNotes(invoice.notes || "");
        const parsedItems = parseItems(invoice.items);
        const safeItems = parsedItems.length ? parsedItems : [{ description: "", quantity: 1, unit_price: 0 }];
        setItems(safeItems.map((it) => ({ ...it, unit_price: fromBaseEur(Number(it.unit_price) || 0) })));
      } else if (prefillData) {
        setInvoiceNumber(`F-${format(new Date(), "yyyy")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`);
        setClientId(prefillData.clientId || "");
        const prefillItems = prefillData.items || [{ description: "", quantity: 1, unit_price: 0 }];
        setItems(prefillItems.map((it) => ({ ...it, unit_price: fromBaseEur(Number(it.unit_price) || 0) })));
        setNotes(prefillData.notes || "");
        setIssueDate(today);
        setDueDate(defaultDueDate);
      } else {
        setInvoiceNumber(`F-${format(new Date(), "yyyy")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`);
        setClientId("");
        setItems([{ description: "", quantity: 1, unit_price: 0 }]);
        setNotes("");
        setIssueDate(today);
        setDueDate(defaultDueDate);
      }
    }
  }, [open, invoice, prefillData, today, defaultDueDate, currency]);

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

    if (isEditing && invoice) {
      await updateInvoice.mutateAsync({
        id: invoice.id,
        invoice_number: invoiceNumber,
        client_id: clientId || null,
        amount: totalAmountEur,
        issue_date: issueDate,
        due_date: dueDate,
        items: itemsEur,
        notes: notes || null,
      });
    } else {
      await createInvoice.mutateAsync({
        invoice_number: invoiceNumber,
        client_id: clientId || null,
        amount: totalAmountEur,
        issue_date: issueDate,
        due_date: dueDate,
        items: itemsEur,
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
