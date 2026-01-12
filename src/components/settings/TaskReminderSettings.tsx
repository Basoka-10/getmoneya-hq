import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTaskReminders } from "@/hooks/useTaskReminders";
import { Bell, BellRing, Check, X } from "lucide-react";
import { toast } from "sonner";

export function TaskReminderSettings() {
  const { notificationPermission, requestPermission, isSupported } = useTaskReminders();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications activées ! Vous recevrez des rappels pour vos tâches.");
    } else {
      toast.error("Notifications refusées. Veuillez autoriser les notifications dans les paramètres de votre navigateur.");
    }
  };

  const isEnabled = notificationPermission === "granted";
  const isDenied = notificationPermission === "denied";

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
      {/* Notification Permission Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            isEnabled ? "bg-green-500/10 text-green-500" : 
            isDenied ? "bg-destructive/10 text-destructive" : 
            "bg-primary/10 text-primary"
          }`}>
            {isEnabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Rappels de tâches</p>
            <p className="text-sm text-muted-foreground">
              {!isSupported ? "Non supporté par votre navigateur" :
               isEnabled ? "Notifications activées" :
               isDenied ? "Notifications bloquées" :
               "Recevez des rappels avant vos tâches"}
            </p>
          </div>
        </div>
        
        {isSupported && !isEnabled && !isDenied && (
          <Button onClick={handleEnableNotifications} size="sm" variant="outline">
            Activer
          </Button>
        )}
        
        {isEnabled && (
          <div className="flex items-center gap-2 text-green-500">
            <Check className="h-4 w-4" />
            <span className="text-sm">Activé</span>
          </div>
        )}
        
        {isDenied && (
          <div className="flex items-center gap-2 text-destructive">
            <X className="h-4 w-4" />
            <span className="text-sm">Bloqué</span>
          </div>
        )}
      </div>

      {isDenied && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">
            Les notifications sont bloquées. Pour les activer, modifiez les paramètres de votre navigateur 
            pour ce site, puis rafraîchissez la page.
          </p>
        </div>
      )}

      <Separator />

      {/* Other notification settings - non-functional placeholders */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Alertes financières</p>
          <p className="text-sm text-muted-foreground">
            Notification si 70% du capital est dépensé
          </p>
        </div>
        <Switch defaultChecked />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Factures impayées</p>
          <p className="text-sm text-muted-foreground">
            Alertes pour les factures en retard
          </p>
        </div>
        <Switch defaultChecked />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Résumé hebdomadaire</p>
          <p className="text-sm text-muted-foreground">
            Récapitulatif chaque lundi matin
          </p>
        </div>
        <Switch />
      </div>

      {/* Info about how reminders work */}
      {isEnabled && (
        <>
          <Separator />
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              Comment fonctionnent les rappels ?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Créez une tâche avec une heure précise</li>
              <li>• Choisissez le délai de rappel (5, 10, 15, 30 min ou 1h avant)</li>
              <li>• Vous recevrez une notification à l'heure du rappel</li>
              <li>• Gardez l'onglet ouvert pour recevoir les notifications</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
