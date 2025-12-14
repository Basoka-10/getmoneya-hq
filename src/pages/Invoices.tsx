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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data from document
const mockQuotations = [
  {
    id: "D-2024-001",
    client: "Startup Innovations",
    amount: 4500,
    status: "draft" as const,
    date: "12 déc. 2024",
  },
  {
    id: "D-2024-002",
    client: "Gamma Tech",
    amount: 8200,
    status: "sent" as const,
    date: "10 déc. 2024",
  },
  {
    id: "D-2024-003",
    client: "ABC Corporation",
    amount: 3500,
    status: "accepted" as const,
    date: "05 déc. 2024",
  },
];

const mockInvoices = [
  {
    id: "F-2024-012",
    client: "ABC Corporation",
    amount: 3500,
    status: "paid" as const,
    date: "14 déc. 2024",
  },
  {
    id: "F-2024-011",
    client: "Beta Industries",
    amount: 2500,
    status: "unpaid" as const,
    date: "01 déc. 2024",
    dueDate: "15 déc. 2024",
  },
  {
    id: "F-2024-010",
    client: "Delta Services SA",
    amount: 1800,
    status: "paid" as const,
    date: "28 nov. 2024",
  },
  {
    id: "F-2024-009",
    client: "ABC Corporation",
    amount: 4200,
    status: "paid" as const,
    date: "15 nov. 2024",
  },
];

const quotationStatusStyles = {
  draft: {
    label: "Brouillon",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
  sent: {
    label: "Envoyé",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  accepted: {
    label: "Accepté",
    bg: "bg-success/10",
    text: "text-success",
  },
};

const invoiceStatusStyles = {
  paid: {
    label: "Payée",
    bg: "bg-success/10",
    text: "text-success",
  },
  unpaid: {
    label: "Non payée",
    bg: "bg-destructive/10",
    text: "text-destructive",
  },
};

const Invoices = () => {
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
              {mockQuotations.filter((q) => q.status === "sent").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockQuotations
                .filter((q) => q.status === "sent")
                .reduce((acc, q) => acc + q.amount, 0)
                .toLocaleString("fr-FR")}{" "}
              € en cours
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Factures non payées</p>
            <p className="mt-1 text-2xl font-semibold text-destructive">
              {mockInvoices.filter((i) => i.status === "unpaid").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockInvoices
                .filter((i) => i.status === "unpaid")
                .reduce((acc, i) => acc + i.amount, 0)
                .toLocaleString("fr-FR")}{" "}
              € à encaisser
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">
              Factures payées (mois)
            </p>
            <p className="mt-1 text-2xl font-semibold text-success">
              {mockInvoices.filter((i) => i.status === "paid").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockInvoices
                .filter((i) => i.status === "paid")
                .reduce((acc, i) => acc + i.amount, 0)
                .toLocaleString("fr-FR")}{" "}
              € encaissés
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
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockInvoices.map((invoice) => {
                    const status = invoiceStatusStyles[invoice.status];
                    return (
                      <tr
                        key={invoice.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm font-medium text-foreground">
                            {invoice.id}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          {invoice.client}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          {invoice.date}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              status.bg,
                              status.text
                            )}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-foreground">
                          {invoice.amount.toLocaleString("fr-FR")} €
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockQuotations.map((quotation) => {
                    const status = quotationStatusStyles[quotation.status];
                    return (
                      <tr
                        key={quotation.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm font-medium text-foreground">
                            {quotation.id}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          {quotation.client}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          {quotation.date}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              status.bg,
                              status.text
                            )}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-foreground">
                          {quotation.amount.toLocaleString("fr-FR")} €
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {quotation.status === "draft" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Invoices;
