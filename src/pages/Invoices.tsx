import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  FileText,
  FilePlus,
  MoreHorizontal,
  Download,
  Send,
  Trash2,
  Loader2,
  ArrowRightLeft,
  Check,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useInvoices, useDeleteInvoice, useUpdateInvoice, Invoice } from "@/hooks/useInvoices";
import { useQuotations, useDeleteQuotation, useUpdateQuotation, Quotation } from "@/hooks/useQuotations";
import { useClients } from "@/hooks/useClients";
import { useCurrency, ALL_CURRENCY_CONFIGS } from "@/contexts/CurrencyContext";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { QuotationModal } from "@/components/modals/QuotationModal";
import { downloadPDF } from "@/utils/pdfGenerator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const quotationStatusStyles = {
  draft: { label: "Brouillon", bg: "bg-muted", text: "text-muted-foreground" },
  sent: { label: "Envoyé", bg: "bg-primary/10", text: "text-primary" },
  accepted: { label: "Accepté", bg: "bg-success/10", text: "text-success" },
  rejected: { label: "Refusé", bg: "bg-destructive/10", text: "text-destructive" },
  expired: { label: "Expiré", bg: "bg-muted", text: "text-muted-foreground" },
};

const invoiceStatusStyles = {
  draft: { label: "Brouillon", bg: "bg-muted", text: "text-muted-foreground" },
  sent: { label: "Envoyée", bg: "bg-primary/10", text: "text-primary" },
  paid: { label: "Payée", bg: "bg-success/10", text: "text-success" },
  overdue: { label: "En retard", bg: "bg-destructive/10", text: "text-destructive" },
  cancelled: { label: "Annulée", bg: "bg-muted", text: "text-muted-foreground" },
};

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const Invoices = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<(Invoice & { clients: { name: string } | null }) | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<(Quotation & { clients: { name: string } | null }) | null>(null);
  const [invoicePrefillData, setInvoicePrefillData] = useState<{
    clientId?: string;
    items?: LineItem[];
    notes?: string;
  } | undefined>(undefined);

  const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();
  const { data: quotations = [], isLoading: loadingQuotations } = useQuotations();
  const { data: clients = [] } = useClients();
  const deleteInvoice = useDeleteInvoice();
  const deleteQuotation = useDeleteQuotation();
  const updateInvoice = useUpdateInvoice();
  const updateQuotation = useUpdateQuotation();
  const { formatAmount, currencyConfig } = useCurrency();

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy", { locale: fr });
  };

  // Format currency using user's current currency preference (single source of truth)
  const formatCurrency = (amount: number) => {
    const noDecimalCurrencies = ["XOF", "XAF", "GNF", "RWF", "UGX", "TZS", "SLL"];
    const decimals = noDecimalCurrencies.includes(currencyConfig.code) ? 0 : currencyConfig.decimals;
    
    const formatted = amount.toLocaleString(currencyConfig.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    if (currencyConfig.code === "USD") {
      return `${currencyConfig.symbol}${formatted}`;
    }
    return `${formatted} ${currencyConfig.symbol}`;
  };

  const getClientById = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId);
  };

  // Parse items safely
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
    if (Array.isArray(items)) return items;
    return [];
  };

  // Download invoice as PDF - always use user's current currency
  const handleDownloadInvoice = (invoice: Invoice & { clients: { name: string } | null }) => {
    const client = getClientById(invoice.client_id);
    const invoiceItems = parseItems(invoice.items).map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
    }));

    const success = downloadPDF({
      type: "invoice",
      number: invoice.invoice_number,
      clientName: invoice.clients?.name,
      clientEmail: client?.email || undefined,
      clientCompany: client?.company || undefined,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      items: invoiceItems,
      notes: invoice.notes || undefined,
      amount: Number(invoice.amount) || 0,
      currencySymbol: currencyConfig.symbol,
      currencyLocale: currencyConfig.locale,
    });
    
    if (success) {
      toast.success("Facture téléchargée");
    } else {
      toast.error("Erreur lors du téléchargement");
    }
  };

  // Download quotation as PDF - always use user's current currency
  const handleDownloadQuotation = (quotation: Quotation & { clients: { name: string } | null }) => {
    const client = getClientById(quotation.client_id);
    const quotationItems = parseItems(quotation.items).map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
    }));

    const success = downloadPDF({
      type: "quotation",
      number: quotation.quotation_number,
      clientName: quotation.clients?.name,
      clientEmail: client?.email || undefined,
      clientCompany: client?.company || undefined,
      issueDate: quotation.issue_date,
      validUntil: quotation.valid_until,
      items: quotationItems,
      notes: quotation.notes || undefined,
      amount: Number(quotation.amount) || 0,
      currencySymbol: currencyConfig.symbol,
      currencyLocale: currencyConfig.locale,
    });
    
    if (success) {
      toast.success("Devis téléchargé");
    } else {
      toast.error("Erreur lors du téléchargement");
    }
  };

  // Convert quotation to invoice
  const handleConvertToInvoice = (quotation: Quotation & { clients: { name: string } | null }) => {
    const items = parseItems(quotation.items);
    
    setInvoicePrefillData({
      clientId: quotation.client_id || undefined,
      items: items,
      notes: quotation.notes || undefined,
    });
    setShowInvoiceModal(true);
    toast.info("Créez la facture à partir de ce devis");
  };

  // Calculate stats
  const pendingQuotations = quotations.filter((q) => q.status === "sent");
  const unpaidInvoices = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const paidInvoices = invoices.filter((i) => i.status === "paid");

  const handleOpenNewInvoice = () => {
    setEditingInvoice(null);
    setInvoicePrefillData(undefined);
    setShowInvoiceModal(true);
  };

  const handleEditInvoice = (invoice: Invoice & { clients: { name: string } | null }) => {
    setEditingInvoice(invoice);
    setInvoicePrefillData(undefined);
    setShowInvoiceModal(true);
  };

  const handleOpenNewQuotation = () => {
    setEditingQuotation(null);
    setShowQuotationModal(true);
  };

  const handleEditQuotation = (quotation: Quotation & { clients: { name: string } | null }) => {
    setEditingQuotation(quotation);
    setShowQuotationModal(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Facturation
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gérez vos devis et factures.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Devis en attente</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {pendingQuotations.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(pendingQuotations.reduce((acc, q) => acc + Number(q.amount), 0))} en cours
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Factures non payées</p>
            <p className="mt-1 text-2xl font-semibold text-destructive">
              {unpaidInvoices.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(unpaidInvoices.reduce((acc, i) => acc + Number(i.amount), 0))} à encaisser
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Factures payées</p>
            <p className="mt-1 text-2xl font-semibold text-success">
              {paidInvoices.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(paidInvoices.reduce((acc, i) => acc + Number(i.amount), 0))} encaissés
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="quotations" className="gap-2">
              <FilePlus className="h-4 w-4" />
              Devis
            </TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={handleOpenNewInvoice}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="w-full overflow-x-auto moneya-scrollbar">
                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Aucune facture créée</p>
                    <Button variant="outline" className="mt-4" onClick={handleOpenNewInvoice}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer votre première facture
                    </Button>
                  </div>
                ) : (
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Référence</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Statut</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Montant</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoices.map((invoice) => {
                        const status = invoiceStatusStyles[invoice.status];
                        return (
                          <tr key={invoice.id} className="transition-colors hover:bg-muted/30">
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4">
                              <span className="text-sm font-medium text-foreground">{invoice.invoice_number}</span>
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-sm text-muted-foreground">
                              {invoice.clients?.name || "-"}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-sm text-muted-foreground">
                              {formatDate(invoice.issue_date)}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4">
                              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", status.bg, status.text)}>
                                {status.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-right text-sm font-semibold text-foreground">
                              {formatCurrency(Number(invoice.amount))}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {invoice.status === "draft" && (
                                    <DropdownMenuItem onClick={() => updateInvoice.mutate({ id: invoice.id, status: "sent" })}>
                                      <Send className="mr-2 h-4 w-4" />
                                      Marquer comme envoyée
                                    </DropdownMenuItem>
                                  )}
                                  {(invoice.status === "sent" || invoice.status === "overdue") && (
                                    <DropdownMenuItem onClick={() => updateInvoice.mutate({ id: invoice.id, status: "paid" })}>
                                      <Check className="mr-2 h-4 w-4" />
                                      Marquer comme payée
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => deleteInvoice.mutate(invoice.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={handleOpenNewQuotation}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="w-full overflow-x-auto moneya-scrollbar">
                {loadingQuotations ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : quotations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FilePlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Aucun devis créé</p>
                    <Button variant="outline" className="mt-4" onClick={handleOpenNewQuotation}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer votre premier devis
                    </Button>
                  </div>
                ) : (
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Référence</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Statut</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Montant</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {quotations.map((quotation) => {
                        const status = quotationStatusStyles[quotation.status];
                        return (
                          <tr key={quotation.id} className="transition-colors hover:bg-muted/30">
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4">
                              <span className="text-sm font-medium text-foreground">{quotation.quotation_number}</span>
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-sm text-muted-foreground">
                              {quotation.clients?.name || "-"}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-sm text-muted-foreground">
                              {formatDate(quotation.issue_date)}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4">
                              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", status.bg, status.text)}>
                                {status.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-right text-sm font-semibold text-foreground">
                              {formatCurrency(Number(quotation.amount))}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownloadQuotation(quotation)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditQuotation(quotation)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConvertToInvoice(quotation)}>
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    Convertir en facture
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {quotation.status === "draft" && (
                                    <DropdownMenuItem onClick={() => updateQuotation.mutate({ id: quotation.id, status: "sent" })}>
                                      <Send className="mr-2 h-4 w-4" />
                                      Marquer comme envoyé
                                    </DropdownMenuItem>
                                  )}
                                  {quotation.status === "sent" && (
                                    <DropdownMenuItem onClick={() => updateQuotation.mutate({ id: quotation.id, status: "accepted" })}>
                                      <Check className="mr-2 h-4 w-4" />
                                      Marquer comme accepté
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => deleteQuotation.mutate(quotation.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <InvoiceModal 
        open={showInvoiceModal} 
        onOpenChange={(open) => {
          setShowInvoiceModal(open);
          if (!open) setEditingInvoice(null);
        }}
        invoice={editingInvoice}
        prefillData={invoicePrefillData}
      />
      <QuotationModal 
        open={showQuotationModal} 
        onOpenChange={(open) => {
          setShowQuotationModal(open);
          if (!open) setEditingQuotation(null);
        }}
        quotation={editingQuotation}
      />
    </AppLayout>
  );
};

export default Invoices;
