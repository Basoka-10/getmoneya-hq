import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Log immédiat pour confirmer la réception - AVANT tout parsing
  console.log("==============================================");
  console.log("=== MONEROO WEBHOOK RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  
  // Log des headers importants
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log("Headers:", JSON.stringify(headers, null, 2));

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Lire le body raw d'abord
    const rawBody = await req.text();
    console.log("Raw body received:", rawBody);
    console.log("Raw body length:", rawBody.length);

    // Parser le JSON
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log("Parsed body:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ received: true, error: "Invalid JSON" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Format Moneroo selon la documentation:
    // { "event": "payment.success", "data": { "id": "...", "status": "...", ... } }
    const eventType = body.event;
    const paymentData = body.data;

    console.log("=== EXTRACTED DATA ===");
    console.log("Event type:", eventType);
    console.log("Payment data:", JSON.stringify(paymentData, null, 2));

    if (!paymentData) {
      console.log("No payment data in webhook body");
      return new Response(
        JSON.stringify({ received: true, warning: "no payment data" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extraire les informations du paiement selon le format Moneroo
    const paymentId = paymentData.id;
    const status = paymentData.status;
    const amount = paymentData.amount;
    const currency = paymentData.currency;
    const metadata = paymentData.metadata || {};
    
    console.log("=== PAYMENT DETAILS ===");
    console.log("Payment ID:", paymentId);
    console.log("Status:", status);
    console.log("Amount:", amount);
    console.log("Currency:", currency);
    console.log("Metadata:", JSON.stringify(metadata, null, 2));

    if (!paymentId) {
      console.log("No payment ID found in webhook");
      return new Response(
        JSON.stringify({ received: true, warning: "no payment id" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mettre à jour le statut du paiement en base
    console.log("=== UPDATING PAYMENT IN DATABASE ===");
    const { error: paymentUpdateError, data: updatedPayment } = await supabase
      .from("payments")
      .update({ 
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("moneroo_payment_id", paymentId)
      .select()
      .single();

    if (paymentUpdateError) {
      console.error("Error updating payment:", paymentUpdateError);
    } else {
      console.log("Payment updated successfully:", JSON.stringify(updatedPayment, null, 2));
    }

    // Si le paiement est réussi, activer l'abonnement
    const isSuccess = eventType === "payment.success" || 
                      (status && ["success", "paid", "completed", "successful"].includes(status.toLowerCase()));

    console.log("=== SUBSCRIPTION CHECK ===");
    console.log("Is success event:", isSuccess);
    console.log("Event type check:", eventType === "payment.success");
    console.log("Status check:", status);

    if (isSuccess) {
      // Récupérer user_id et plan depuis les metadata ou depuis notre enregistrement de paiement
      let userId = metadata.user_id;
      let plan = metadata.plan;

      console.log("From metadata - user_id:", userId, "plan:", plan);

      // Si metadata n'a pas les infos, les chercher dans notre enregistrement
      if (!userId || !plan) {
        console.log("Metadata incomplete, fetching from payment record...");
        const { data: paymentRecord } = await supabase
          .from("payments")
          .select("*")
          .eq("moneroo_payment_id", paymentId)
          .single();

        if (paymentRecord) {
          userId = userId || paymentRecord.user_id;
          plan = plan || paymentRecord.plan;
          console.log("From payment record - user_id:", userId, "plan:", plan);
        }
      }

      if (userId && plan) {
        console.log("=== ACTIVATING SUBSCRIPTION ===");
        console.log("User ID:", userId);
        console.log("Plan:", plan);

        // Calculer la date d'expiration (1 mois)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Vérifier si l'utilisateur a déjà un abonnement
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single();

        console.log("Existing subscription:", existingSub);

        const subscriptionData = {
          plan: plan,
          status: "active",
          payment_id: paymentId,
          amount: amount || (plan === "business" ? 4500 : 2000),
          currency: currency || "XOF",
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Subscription data:", JSON.stringify(subscriptionData, null, 2));

        if (existingSub) {
          // Mettre à jour l'abonnement existant
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update(subscriptionData)
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating subscription:", updateError);
          } else {
            console.log(`✅ SUBSCRIPTION UPDATED for user ${userId} - Plan: ${plan} - Expires: ${expiresAt.toISOString()}`);
          }
        } else {
          // Créer un nouvel abonnement
          const { error: insertError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              ...subscriptionData,
            });

          if (insertError) {
            console.error("Error creating subscription:", insertError);
          } else {
            console.log(`✅ SUBSCRIPTION CREATED for user ${userId} - Plan: ${plan} - Expires: ${expiresAt.toISOString()}`);
          }
        }
      } else {
        console.log("❌ Missing user_id or plan - cannot activate subscription");
        console.log("Available metadata keys:", Object.keys(metadata));
      }
    } else {
      console.log(`ℹ️ Event "${eventType}" with status "${status}" is not a success event, not activating subscription`);
    }

    // Répondre immédiatement avec 200 (exigence Moneroo: 3 secondes max)
    console.log("=== WEBHOOK PROCESSING COMPLETE ===");
    console.log("==============================================");
    
    return new Response(
      JSON.stringify({ received: true, processed: true, event: eventType, status: status }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "no stack");
    
    // Toujours retourner 200 pour éviter les retry inutiles
    return new Response(
      JSON.stringify({ received: true, error: String(error) }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
