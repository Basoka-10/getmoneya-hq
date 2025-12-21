import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isActivating, setIsActivating] = useState(true);
  const [activated, setActivated] = useState(false);

  const plan = searchParams.get("plan");
  const userId = searchParams.get("user_id");

  useEffect(() => {
    const activateSubscription = async () => {
      if (!user?.id || !plan) {
        setIsActivating(false);
        return;
      }

      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if subscription was activated by webhook
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (subscription?.status === "active" && subscription?.plan === plan) {
          setActivated(true);
          toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
        } else {
          // If webhook hasn't processed yet, create subscription manually
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          const { error } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: user.id,
              plan: plan,
              status: "active",
              started_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            }, {
              onConflict: "user_id"
            });

          if (!error) {
            setActivated(true);
            toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
          }
        }
      } catch (error) {
        console.error("Error activating subscription:", error);
      } finally {
        setIsActivating(false);
      }
    };

    activateSubscription();
  }, [user?.id, plan]);

  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Pro";
  const planPrice = plan === "business" ? "17€" : "7€";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {isActivating ? (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Activation en cours...
            </h1>
            <p className="text-muted-foreground">
              Nous activons votre abonnement {planName}
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Paiement réussi !
              </h1>
              <p className="text-muted-foreground">
                Votre abonnement {planName} à {planPrice}/mois est maintenant actif
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">{planName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-semibold text-foreground">{planPrice}/mois</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="text-green-500 font-semibold">Actif</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
              size="lg"
            >
              Accéder à mon tableau de bord
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
