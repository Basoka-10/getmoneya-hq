import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("=== MONEROO WEBHOOK RECEIVED ===");
    console.log("Full body:", JSON.stringify(body, null, 2));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Moneroo can send different event formats
    const eventType = body.event || body.type || body.event_type;
    const paymentData = body.data || body.payment || body;

    console.log("Event type:", eventType);
    console.log("Payment data:", JSON.stringify(paymentData, null, 2));

    if (!paymentData) {
      console.log("No payment data in webhook");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract payment ID - Moneroo might use different field names
    const paymentId = paymentData.id || paymentData.payment_id || paymentData.reference;
    const status = paymentData.status || body.status;
    
    // Metadata can be nested differently
    const metadata = paymentData.metadata || paymentData.customer?.metadata || body.metadata || {};
    
    console.log(`Payment ID: ${paymentId}`);
    console.log(`Status: ${status}`);
    console.log(`Metadata:`, JSON.stringify(metadata, null, 2));

    if (!paymentId) {
      console.log("No payment ID found in webhook");
      return new Response(JSON.stringify({ received: true, warning: "no payment id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update payment status in database
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
      console.log("Payment updated:", updatedPayment);
    }

    // If payment is successful, activate the subscription
    const successStatuses = ["success", "paid", "completed", "successful"];
    if (status && successStatuses.includes(status.toLowerCase())) {
      // Get user_id and plan from metadata or from our payment record
      let userId = metadata.user_id || metadata.userId;
      let plan = metadata.plan;

      // If metadata doesn't have user info, get it from our payment record
      if (!userId || !plan) {
        const { data: paymentRecord } = await supabase
          .from("payments")
          .select("*")
          .eq("moneroo_payment_id", paymentId)
          .single();

        if (paymentRecord) {
          userId = userId || paymentRecord.user_id;
          plan = plan || paymentRecord.plan;
          console.log("Got user info from payment record:", { userId, plan });
        }
      }

      if (userId && plan) {
        console.log(`=== ACTIVATING SUBSCRIPTION ===`);
        console.log(`User ID: ${userId}`);
        console.log(`Plan: ${plan}`);

        // Calculate expiry date (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Get amount from payment data
        const amount = paymentData.amount ? paymentData.amount / 100 : (plan === "business" ? 17 : 7);
        const currency = paymentData.currency?.code || paymentData.currency || "EUR";

        // Check if user already has a subscription
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single();

        const subscriptionData = {
          plan: plan,
          status: "active",
          payment_id: paymentId,
          amount: amount,
          currency: currency,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (existingSub) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update(subscriptionData)
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating subscription:", updateError);
          } else {
            console.log(`✅ Subscription UPDATED for user ${userId} - Plan: ${plan} - Expires: ${expiresAt.toISOString()}`);
          }
        } else {
          // Create new subscription
          const { error: insertError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              ...subscriptionData,
            });

          if (insertError) {
            console.error("Error creating subscription:", insertError);
          } else {
            console.log(`✅ Subscription CREATED for user ${userId} - Plan: ${plan} - Expires: ${expiresAt.toISOString()}`);
          }
        }
      } else {
        console.log("Missing user_id or plan - cannot activate subscription");
        console.log("Available metadata keys:", Object.keys(metadata));
      }
    } else {
      console.log(`Payment status "${status}" is not a success status, not activating subscription`);
    }

    return new Response(
      JSON.stringify({ received: true, processed: true, status: status }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
