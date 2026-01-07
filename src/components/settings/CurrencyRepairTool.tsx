import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, Wrench, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CurrencyRepairTool() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cutoffDate, setCutoffDate] = useState<Date | undefined>(new Date());
  const [isRepairing, setIsRepairing] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const fetchPreviewCount = async () => {
    if (!user || !cutoffDate) return;

    const { count, error } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("created_at", cutoffDate.toISOString());

    if (error) {
      console.error("Erreur lors du comptage:", error);
      return;
    }

    setPreviewCount(count);
  };

  const handleRepair = async () => {
    if (!user || !cutoffDate) return;

    setIsRepairing(true);

    try {
      // Mettre à jour toutes les transactions avant la date de coupure
      const { data, error } = await supabase
        .from("transactions")
        .update({ currency_code: "XOF" })
        .eq("user_id", user.id)
        .lte("created_at", cutoffDate.toISOString())
        .select("id");

      if (error) throw error;

      const count = data?.length || 0;

      // Invalider les queries pour rafraîchir les données
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["transaction-stats"] });

      toast.success(`${count} transaction(s) corrigée(s) vers XOF`);
      setPreviewCount(null);
    } catch (error) {
      console.error("Erreur lors de la réparation:", error);
      toast.error("Erreur lors de la réparation des transactions");
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Wrench className="h-5 w-5" />
          Outil de réparation des devises
        </CardTitle>
        <CardDescription>
          Corrige le code devise des transactions créées avant une certaine date. 
          Utile si vos anciennes transactions ont été corrompues par un changement de devise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Remettre en XOF toutes les transactions créées avant :
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !cutoffDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {cutoffDate ? format(cutoffDate, "PPP", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={cutoffDate}
                onSelect={(date) => {
                  setCutoffDate(date);
                  setPreviewCount(null);
                }}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={fetchPreviewCount}
            disabled={!cutoffDate}
          >
            Prévisualiser
          </Button>

          {previewCount !== null && (
            <span className="flex items-center text-sm text-muted-foreground">
              {previewCount} transaction(s) seront modifiées
            </span>
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={!cutoffDate || isRepairing}
              className="w-full"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {isRepairing ? "Réparation en cours..." : "Réparer les transactions"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la réparation</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va remettre le code devise <strong>XOF (Franc CFA)</strong> sur toutes 
                les transactions créées avant le {cutoffDate ? format(cutoffDate, "PPP", { locale: fr }) : ""}.
                <br /><br />
                Les montants ne seront pas modifiés, seul le code devise sera corrigé.
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleRepair}>
                Confirmer la réparation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-muted-foreground">
          💡 Astuce : Choisissez la date à laquelle vous avez changé de devise pour la première fois. 
          Toutes les transactions créées avant cette date seront remises en XOF.
        </p>
      </CardContent>
    </Card>
  );
}
