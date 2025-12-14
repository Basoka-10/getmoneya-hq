import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvoice, Invoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { format, addDays } from "date-fns";
import { Plus, Trash2 } from "lucide-react";

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export function InvoiceModal({ open, onOpenChange, invoice }: InvoiceModalProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const defaultDueDate = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoice_number || `F-${format(new Date(), "yyyy")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`);
  const [clientId, setClientId] = useState(invoice?.client_id || "");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date || today);
  const [dueDate, setDueDate] = useState(invoice?.due_date || defaultDueDate);
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [items, setItems] = useState<LineItem[]>(
    invoice?.items?.length ? invoice.items : [{ description: "", quantity: 1, unit_price: 0 }]
  );

  const createInvoice = useCreateInvoice();
  const { data: clients } = useClients();

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

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
    
    await createInvoice.mutateAsync({
      invoice_number: invoiceNumber,
      client_id: clientId || null,
      amount: totalAmount,
      issue_date: issueDate,
      due_date: dueDate,
      items: items.filter(item => item.description),
      notes: notes || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nouvelle facture</DialogTitle>
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
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
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
              Total: {totalAmount.toLocaleString("fr-FR")} €
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
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
