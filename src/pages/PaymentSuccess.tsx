import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ArrowRight, AlertCircle, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isActivating, setIsActivating] = useState(true);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [needsAuth, setNeedsAuth] = useState(false);

  const plan = searchParams.get("plan");
  const paymentId = searchParams.get("paymentId");
  const userId = searchParams.get("user_id");

  // Rediriger vers login si pas connecté après le chargement auth
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, showing login prompt");
      setNeedsAuth(true);
      setIsActivating(false);
    }
  }, [authLoading, user]);

  const activateSubscription = async () => {
    const currentUserId = user?.id;
    
    if (!currentUserId || !plan) {
      console.log("Missing user or plan:", { currentUserId, plan });
      setIsActivating(false);
      if (!currentUserId) {
        setNeedsAuth(true);
      } else {
        setError("Informations de paiement manquantes");
      }
      return;
    }

    setIsActivating(true);
    setError(null);
    setNeedsAuth(false);

    try {
      console.log("=== STARTING SUBSCRIPTION ACTIVATION ===");
      console.log("User ID:", currentUserId);
      console.log("Plan:", plan);
      console.log("Payment ID:", paymentId);
      console.log("Retry count:", retryCount);

      // D'abord vérifier si l'abonnement est déjà actif
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", currentUserId)
        .single();

      console.log("Existing subscription:", existingSub);

      if (existingSub?.status === "active" && existingSub?.plan === plan) {
        console.log("Subscription already active!");
        setActivated(true);
        toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
        setIsActivating(false);
        return;
      }

      // Appeler verify-payment pour vérifier avec Moneroo et activer
      if (paymentId && paymentId !== "unknown") {
        console.log("Calling verify-payment function...");
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
          body: {
            payment_id: paymentId,
            user_id: currentUserId,
            plan: plan,
          },
        });

        console.log("Verify payment response:", verifyData);
        if (verifyError) {
          console.error("Verify payment error:", verifyError);
        }

        if (verifyData?.success && verifyData?.status === "active") {
          console.log("Subscription activated via verify-payment!");
          setActivated(true);
          toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
          setIsActivating(false);
          return;
        }

        // Si le paiement n'est pas encore confirmé, attendre et réessayer
        if (verifyData?.status === "pending" && retryCount < 5) {
          console.log(`Payment still pending, retry ${retryCount + 1}/5 in 3 seconds...`);
          setError("Paiement en cours de traitement... Veuillez patienter.");
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
          return;
        }
      }

      // Fallback: vérifier si un paiement existe en base avec statut success
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

      // IMPORTANT: Ne créer l'abonnement que si le paiement est confirmé comme success
      if (payment && payment.status === "success") {
        console.log("Payment confirmed as success in DB, activating subscription...");
        
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
          console.log("Subscription created/updated successfully via fallback");
          setActivated(true);
          toast.success(`Votre abonnement ${plan.charAt(0).toUpperCase() + plan.slice(1)} est activé !`);
        } else {
          console.error("Error creating subscription:", result.error);
          setError("Erreur lors de l'activation. Veuillez réessayer.");
        }
      } else if (payment && payment.status === "pending") {
        // Paiement en attente, réessayer
        if (retryCount < 5) {
          console.log(`Payment pending, retry ${retryCount + 1}/5...`);
          setError("Paiement en cours de vérification... Veuillez patienter.");
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
          return;
        }
        setError("Le paiement n'est pas encore confirmé. Veuillez patienter quelques minutes et rafraîchir la page.");
      } else {
        // Pas de paiement trouvé, réessayer
        if (retryCount < 5) {
          console.log(`No payment found, retry ${retryCount + 1}/5...`);
          setError("Recherche du paiement en cours...");
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
          return;
        }
        setError("Paiement non trouvé. Si vous avez payé, veuillez patienter quelques minutes.");
      }
    } catch (err) {
      console.error("Error activating subscription:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsActivating(false);
    }
  };

  useEffect(() => {
    // Ne pas lancer si auth en cours de chargement ou pas d'utilisateur
    if (authLoading || !user) {
      return;
    }

    // Attendre un peu pour laisser le webhook traiter
    const timer = setTimeout(() => {
      activateSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user?.id, plan, retryCount, authLoading]);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    activateSubscription();
  };

  const handleLogin = () => {
    // Sauvegarder les paramètres de paiement pour après la connexion
    const returnUrl = `/payment-success?plan=${plan}&user_id=${userId}&paymentId=${paymentId}`;
    navigate(`/auth?returnTo=${encodeURIComponent(returnUrl)}`);
  };

  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Pro";
  const planPrice = plan === "business" ? "4500 FCFA" : "2000 FCFA";

  // Afficher l'écran de connexion si nécessaire
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Connexion requise
            </h1>
            <p className="text-muted-foreground">
              Veuillez vous connecter pour activer votre abonnement {planName}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {authLoading || isActivating ? (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {authLoading ? "Vérification de la session..." : "Activation en cours..."}
            </h1>
            <p className="text-muted-foreground">
              {authLoading 
                ? "Veuillez patienter" 
                : `Nous vérifions votre paiement et activons votre abonnement ${planName}`
              }
            </p>
            {retryCount > 0 && !authLoading && (
              <p className="text-sm text-muted-foreground">
                Tentative {retryCount}/5...
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
