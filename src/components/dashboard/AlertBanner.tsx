import { AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  type: "warning" | "critical" | "info";
  message: string;
  description?: string;
}

const alertStyles = {
  warning: {
    container: "border-warning/30 bg-warning/5",
    icon: "text-warning",
    title: "text-warning-foreground",
  },
  critical: {
    container: "border-destructive/30 bg-destructive/5",
    icon: "text-destructive",
    title: "text-destructive",
  },
  info: {
    container: "border-primary/30 bg-accent",
    icon: "text-primary",
    title: "text-foreground",
  },
};

const icons = {
  warning: AlertTriangle,
  critical: XCircle,
  info: Info,
};

export function AlertBanner({ type, message, description }: AlertBannerProps) {
  const Icon = icons[type];
  const styles = alertStyles[type];

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 animate-fade-in",
        styles.container
      )}
    >
      <div className={cn("mt-0.5", styles.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className={cn("text-sm font-medium", styles.title)}>{message}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
