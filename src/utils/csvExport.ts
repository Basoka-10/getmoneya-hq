import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: "income" | "expense" | "savings";
  description: string;
}

interface ExportOptions {
  transactions: Transaction[];
  currencyCode: string;
  currencySymbol: string;
  filename?: string;
}

const TYPE_LABELS = {
  income: "Revenu",
  expense: "Dépense",
  savings: "Épargne",
};

export function exportToCSV({
  transactions,
  currencyCode,
  currencySymbol,
  filename = "transactions",
}: ExportOptions): void {
  // CSV headers
  const headers = ["Date", "Description", "Type", "Catégorie", "Montant", "Devise"];
  
  // Convert transactions to CSV rows
  const rows = transactions.map((tx) => [
    format(new Date(tx.date), "dd/MM/yyyy", { locale: fr }),
    `"${tx.description.replace(/"/g, '""')}"`, // Escape quotes
    TYPE_LABELS[tx.type],
    tx.category,
    tx.type === "expense" ? -tx.amount : tx.amount,
    currencyCode,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function filterTransactionsByPeriod<T extends { date: string }>(
  transactions: T[],
  period: "all" | "today" | "week" | "month" | "year"
): T[] {
  if (period === "all") return transactions;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    
    switch (period) {
      case "today":
        return txDate >= startOfDay;
      case "week": {
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        return txDate >= startOfWeek;
      }
      case "month": {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return txDate >= startOfMonth;
      }
      case "year": {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return txDate >= startOfYear;
      }
      default:
        return true;
    }
  });
}
