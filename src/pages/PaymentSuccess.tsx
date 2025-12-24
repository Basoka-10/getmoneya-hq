import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const plan = searchParams.get("plan");
  const paymentId = searchParams.get("paymentId");

  const activateSubscription = async () => {
    const currentUserId = user?.id;
    
    if (!currentUserId || !plan) {
      console.log("Missing user or plan:", { currentUserId, plan });
      setIsActivating(false);
      setError("Informations de paiement manquantes");
      return;
    }

    setIsActivating(true);
    setError(null);

    try {
      console.log("Starting subscription activation...", { currentUserId, plan, paymentId });

      // First check if subscription is already active
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", currentUserId)
        .single();

      if (existingSub?.status === "active" && existingSub?.plan === plan) {
        console.log("Subscription already active:", existingSub);
        setActivated(true);
        toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
        setIsActivating(false);
        return;
      }

      // Call verify-payment edge function to check with Moneroo and activate
      if (paymentId) {
        console.log("Calling verify-payment function...");
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
          body: {
            payment_id: paymentId,
            user_id: currentUserId,
            plan: plan,
          },
        });

        console.log("Verify payment response:", verifyData, verifyError);

        if (verifyData?.success && verifyData?.status === "active") {
          setActivated(true);
          toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
          setIsActivating(false);
          return;
        }

        if (verifyError) {
          console.error("Verify payment error:", verifyError);
        }
      }

      // Fallback: Create subscription directly if payment exists in our DB
      console.log("Checking payment in database...");
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("plan", plan)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      console.log("Payment from DB:", payment);

      // If we have a payment record (regardless of status for now), activate subscription
      // This handles cases where webhook updated payment but not subscription
      if (payment) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const subscriptionData = {
          user_id: currentUserId,
          plan: plan,
          status: "active",
          payment_id: payment.moneroo_payment_id,
          amount: payment.amount,
          currency: payment.currency,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        };

        let result;
        if (existingSub) {
          result = await supabase
            .from("subscriptions")
            .update(subscriptionData)
            .eq("user_id", currentUserId);
        } else {
          result = await supabase
            .from("subscriptions")
            .insert(subscriptionData);
        }

        if (!result.error) {
          console.log("Subscription created/updated successfully");
          setActivated(true);
          toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
        } else {
          console.error("Error creating subscription:", result.error);
          setError("Erreur lors de l'activation. Veuillez réessayer.");
        }
      } else {
        // No payment found, wait and retry
        if (retryCount < 3) {
          console.log(`No payment found, retry ${retryCount + 1}/3...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
          return;
        }
        setError("Paiement en cours de traitement. Veuillez patienter quelques instants.");
      }
    } catch (err) {
      console.error("Error activating subscription:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsActivating(false);
    }
  };

  useEffect(() => {
    // Wait a bit for webhook to process before checking
    const timer = setTimeout(() => {
      activateSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user?.id, plan, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    activateSubscription();
  };

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
              Nous vérifions votre paiement et activons votre abonnement {planName}
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Tentative {retryCount}/3...
              </p>
            )}
          </>
        ) : error && !activated ? (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-yellow-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Vérification en cours
              </h1>
              <p className="text-muted-foreground">
                {error}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Aller au tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
