import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Mail, Trash2, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useClients, useDeleteClient, Client } from "@/hooks/useClients";
import { useTransactions } from "@/hooks/useTransactions";
import { ClientModal } from "@/components/modals/ClientModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clients = [], isLoading } = useClients();
  const { data: transactions = [] } = useTransactions();
  const deleteClient = useDeleteClient();
  const { formatAmountWithSymbol } = useCurrency();

  // Calculate revenue per client
  const getClientRevenue = (clientId: string) => {
    return transactions
      .filter((t) => t.client_id === clientId && t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
  };

  // Filter clients by search query
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleCloseModal = (open: boolean) => {
    setShowModal(open);
    if (!open) setEditingClient(null);
  };

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
          <Button size="sm" onClick={() => setShowModal(true)}>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {clients.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-sm text-muted-foreground">Prospects</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {clients.filter((c) => c.status === "prospect").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">Anciens clients</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {clients.filter((c) => c.status === "former").length}
            </p>
          </div>
        </div>

        {/* Clients Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="w-full overflow-x-auto moneya-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {clients.length === 0 ? "Aucun client enregistré" : "Aucun client trouvé"}
                </p>
                {clients.length === 0 && (
                  <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter votre premier client
                  </Button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Client
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Statut
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Revenus générés
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClients.map((client) => {
                    const status = statusStyles[client.status];
                    const revenue = getClientRevenue(client.id);
                    return (
                      <tr
                        key={client.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary flex-shrink-0">
                              {client.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {client.name}
                              </p>
                              {client.email && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate max-w-[150px]">{client.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                              status.bg,
                              status.text
                            )}
                          >
                            <span
                              className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", status.dot)}
                            />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                          {revenue > 0
                            ? formatAmountWithSymbol(revenue)
                            : "-"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(client)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteClient.mutate(client.id)}
                              >
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
      </div>

      <ClientModal
        open={showModal}
        onOpenChange={handleCloseModal}
        client={editingClient}
      />
    </AppLayout>
  );
};

export default Clients;
