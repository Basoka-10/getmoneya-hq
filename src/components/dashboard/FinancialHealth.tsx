import { cn } from "@/lib/utils";

interface FinancialHealthProps {
  percentageSpent: number;
}

export function FinancialHealth({ percentageSpent }: FinancialHealthProps) {
  const getHealthStatus = (percent: number) => {
    if (percent < 50) return { label: "Excellent", color: "bg-success", textColor: "text-success" };
    if (percent < 70) return { label: "Bon", color: "bg-primary", textColor: "text-primary" };
    if (percent < 85) return { label: "Attention", color: "bg-warning", textColor: "text-warning" };
    return { label: "Critique", color: "bg-destructive", textColor: "text-destructive" };
  };

  const health = getHealthStatus(percentageSpent);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Capital dépensé</span>
        <span className={cn("text-sm font-semibold", health.textColor)}>
          {percentageSpent}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", health.color)}
          style={{ width: `${Math.min(percentageSpent, 100)}%` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 rounded-full", health.color)} />
        <span className={cn("text-sm font-medium", health.textColor)}>
          État : {health.label}
        </span>
      </div>
    </div>
  );
}
