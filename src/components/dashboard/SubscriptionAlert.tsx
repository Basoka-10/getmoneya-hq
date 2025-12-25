import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const DISMISSED_KEY = "moneya_subscription_alert_dismissed";

export function SubscriptionAlert() {
  const { subscription, isPaid, isLoading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Check if alert was dismissed today
  useEffect(() => {
    const dismissedDate = localStorage.getItem(DISMISSED_KEY);
    if (dismissedDate) {
      const today = new Date().toDateString();
      if (dismissedDate === today) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, new Date().toDateString());
    setDismissed(true);
  };

  if (isLoading || dismissed) return null;

  // Only show for paid subscriptions
  if (!isPaid || !subscription?.expires_at) return null;

  const expiryDate = new Date(subscription.expires_at);
  const now = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Only show if expiring within 7 days
  if (daysLeft > 7) return null;

  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 3;

  return (
    <Alert
      variant={isExpired ? "destructive" : "default"}
      className={`relative ${
        isExpired
          ? "border-destructive/50 bg-destructive/10"
          : isUrgent
          ? "border-orange-500/50 bg-orange-500/10"
          : "border-primary/50 bg-primary/10"
      }`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${
          isExpired ? "text-destructive" : isUrgent ? "text-orange-500" : "text-primary"
        }`}
      />
      <AlertTitle className="flex items-center gap-2">
        <Crown className="h-4 w-4" />
        {isExpired
          ? "Votre abonnement a expiré"
          : `Votre abonnement expire ${daysLeft === 1 ? "demain" : `dans ${daysLeft} jours`}`}
      </AlertTitle>
      <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm">
          {isExpired
            ? "Renouvelez maintenant pour continuer à profiter de toutes les fonctionnalités."
            : "Renouvelez votre abonnement pour ne pas perdre l'accès à vos fonctionnalités premium."}
        </span>
        <Link to="/settings" className="shrink-0">
          <Button
            size="sm"
            variant={isExpired ? "destructive" : "default"}
            className="gap-1"
          >
            <Crown className="h-3 w-3" />
            Renouveler
          </Button>
        </Link>
      </AlertDescription>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors"
        aria-label="Fermer l'alerte"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </Alert>
  );
}
