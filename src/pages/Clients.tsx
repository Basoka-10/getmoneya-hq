import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Mock data from document
const mockClients = [
  {
    id: "1",
    name: "ABC Corporation",
    email: "contact@abc-corp.com",
    phone: "+33 6 12 34 56 78",
    status: "active" as const,
    totalRevenue: 12500,
    invoices: 8,
    lastActivity: "Il y a 2 jours",
  },
  {
    id: "2",
    name: "Beta Industries",
    email: "hello@beta-ind.com",
    phone: "+33 6 98 76 54 32",
    status: "active" as const,
    totalRevenue: 8200,
    invoices: 5,
    lastActivity: "Il y a 1 semaine",
  },
  {
    id: "3",
    name: "Startup Innovations",
    email: "team@startup-innov.com",
    phone: "+33 6 11 22 33 44",
    status: "prospect" as const,
    totalRevenue: 0,
    invoices: 0,
    lastActivity: "Il y a 3 jours",
  },
  {
    id: "4",
    name: "Delta Services SA",
    email: "info@delta-services.fr",
    phone: "+33 6 55 66 77 88",
    status: "former" as const,
    totalRevenue: 4800,
    invoices: 3,
    lastActivity: "Il y a 2 mois",
  },
  {
    id: "5",
    name: "Gamma Tech",
    email: "contact@gamma-tech.io",
    phone: "+33 6 99 88 77 66",
    status: "prospect" as const,
    totalRevenue: 0,
    invoices: 0,
    lastActivity: "Il y a 5 jours",
  },
];

const statusStyles = {
  prospect: {
    label: "Prospect",
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  active: {
    label: "Client actif",
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  former: {
    label: "Ancien client",
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const Clients = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="mt-1 text-muted-foreground">
              Gérez vos contacts professionnels.
            </p>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un client
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Clients actifs</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {mockClients.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-sm text-muted-foreground">Prospects</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {mockClients.filter((c) => c.status === "prospect").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">Anciens clients</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {mockClients.filter((c) => c.status === "former").length}
            </p>
          </div>
        </div>

        {/* Clients Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Revenus générés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Factures
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockClients.map((client) => {
                const status = statusStyles[client.status];
                return (
                  <tr
                    key={client.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {client.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          status.bg,
                          status.text
                        )}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {client.totalRevenue > 0
                        ? `${client.totalRevenue.toLocaleString("fr-FR")} €`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {client.invoices > 0 ? client.invoices : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {client.lastActivity}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Clients;
