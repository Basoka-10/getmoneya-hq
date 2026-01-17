import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "success" | "warning" | "destructive";
  subtitle?: string;
}

const iconColorClasses = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "primary",
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-6 transition-all duration-200 hover:border-primary/30 hover:glow-primary">
      <div className="flex items-center gap-2 text-muted-foreground mb-2 sm:mb-3 md:mb-4">
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColorClasses[iconColor])} />
        <p className="text-xs sm:text-sm font-medium">{title}</p>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-card-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        {change && (
          <p
            className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-primary",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}