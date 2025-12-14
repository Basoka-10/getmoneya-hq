import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:bg-secondary/50"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                transaction.type === "income"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {transaction.type === "income" ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.category || transaction.date}
              </p>
            </div>
          </div>
          <p
            className={cn(
              "text-sm font-semibold",
              transaction.type === "income" ? "text-success" : "text-destructive"
            )}
          >
            {transaction.type === "income" ? "+" : "-"}
            {transaction.amount.toLocaleString("fr-FR")} €
          </p>
        </div>
      ))}
    </div>
  );
}
