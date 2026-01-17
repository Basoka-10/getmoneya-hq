import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== VERIFY PAYMENT START ===");
  console.log("Method:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id, user_id, plan } = await req.json();
    console.log("Request data:", { payment_id, user_id, plan });

    const monerooSecretKey = Deno.env.get("MONEROO_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!monerooSecretKey) {
      console.error("MONEROO_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment verification not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // D'abord vérifier si on a déjà un paiement réussi en base
    console.log("Checking existing payment in database...");
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("moneroo_payment_id", payment_id)
      .single();

    console.log("Existing payment:", JSON.stringify(existingPayment, null, 2));

    // Vérifier si l'utilisateur a déjà un abonnement actif
    console.log("Checking existing subscription...");
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .single();

    console.log("Existing subscription:", JSON.stringify(existingSubscription, null, 2));

    // Si l'abonnement est déjà actif avec ce plan, retourner succès
    if (existingSubscription?.status === "active" && existingSubscription?.plan === plan) {
      console.log("Subscription already active with correct plan");
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "active",
          subscription: existingSubscription 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérifier le statut du paiement avec l'API Moneroo
    let paymentStatus = existingPayment?.status;
    
    if (payment_id && payment_id !== "unknown" && (!paymentStatus || paymentStatus === "pending")) {
      try {
        console.log("Calling Moneroo API to verify payment status...");
        console.log("Payment ID:", payment_id);
        
        const monerooResponse = await fetch(`https://api.moneroo.io/v1/payments/${payment_id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${monerooSecretKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        console.log("Moneroo API response status:", monerooResponse.status);

        if (monerooResponse.ok) {
          const monerooData = await monerooResponse.json();
          console.log("Moneroo payment data:", JSON.stringify(monerooData, null, 2));
          
          // Format Moneroo: { data: { status: "..." } }
          paymentStatus = monerooData.data?.status || monerooData.status;
          console.log("Payment status from Moneroo:", paymentStatus);

          // Mettre à jour le statut en base
          if (paymentStatus && paymentStatus !== existingPayment?.status) {
            console.log("Updating payment status in database...");
            const { error: updateError } = await supabase
              .from("payments")
              .update({ 
                status: paymentStatus,
                updated_at: new Date().toISOString()
              })
              .eq("moneroo_payment_id", payment_id);
            
            if (updateError) {
              console.error("Error updating payment status:", updateError);
            } else {
              console.log("Payment status updated to:", paymentStatus);
            }
          }
        } else {
          const errorText = await monerooResponse.text();
          console.error("Moneroo API error:", monerooResponse.status, errorText);
        }
      } catch (apiError) {
        console.error("Error calling Moneroo API:", apiError);
      }
    }

    // Vérifier si le paiement est réussi
    const successStatuses = ["success", "paid", "completed", "successful"];
    const isSuccess = paymentStatus && successStatuses.includes(paymentStatus.toLowerCase());
    
    console.log("Payment status:", paymentStatus);
    console.log("Is success:", isSuccess);

    if (isSuccess) {
      console.log("=== PAYMENT VERIFIED AS SUCCESS, ACTIVATING SUBSCRIPTION ===");

      // Calculer la date d'expiration (1 mois)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const subscriptionData = {
        user_id: user_id,
        plan: plan,
        status: "active",
        payment_id: payment_id,
        amount: existingPayment?.amount || (plan === "business" ? 4500 : 2000),
        currency: existingPayment?.currency || "XOF",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Subscription data:", JSON.stringify(subscriptionData, null, 2));

      let subscriptionResult;
      if (existingSubscription) {
        console.log("Updating existing subscription...");
        const { data, error } = await supabase
          .from("subscriptions")
          .update(subscriptionData)
          .eq("user_id", user_id)
          .select()
          .single();
        
        subscriptionResult = { data, error };
      } else {
        console.log("Creating new subscription...");
        const { data, error } = await supabase
          .from("subscriptions")
          .insert(subscriptionData)
          .select()
          .single();
        
        subscriptionResult = { data, error };
      }

      if (subscriptionResult.error) {
        console.error("Error saving subscription:", subscriptionResult.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to activate subscription",
            details: subscriptionResult.error.message 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("✅ Subscription activated successfully:", JSON.stringify(subscriptionResult.data, null, 2));
      console.log("=== VERIFY PAYMENT SUCCESS ===");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "active",
          subscription: subscriptionResult.data 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Paiement pas encore confirmé
    console.log(`Payment status "${paymentStatus}" is not a success status`);
    console.log("=== VERIFY PAYMENT - NOT YET CONFIRMED ===");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        status: paymentStatus || "pending",
        message: "Payment not yet confirmed" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("=== VERIFY PAYMENT ERROR ===");
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Payment verification failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
