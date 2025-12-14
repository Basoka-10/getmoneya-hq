import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  status: "prospect" | "active" | "former";
  revenue: number;
}

interface ClientsOverviewProps {
  clients: Client[];
}

const statusStyles = {
  prospect: {
    label: "Prospect",
    bg: "bg-warning/10",
    text: "text-warning",
  },
  active: {
    label: "Actif",
    bg: "bg-success/10",
    text: "text-success",
  },
  former: {
    label: "Ancien",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
};

export function ClientsOverview({ clients }: ClientsOverviewProps) {
  return (
    <div className="space-y-3">
      {clients.map((client) => {
        const status = statusStyles[client.status];
        return (
          <div
            key={client.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:bg-secondary/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                {client.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {client.name}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    status.bg,
                    status.text
                  )}
                >
                  {status.label}
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold text-card-foreground">
              {client.revenue.toLocaleString("fr-FR")} €
            </p>
          </div>
        );
      })}
    </div>
  );
}
