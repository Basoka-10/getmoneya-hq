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
    console.log("Moneroo webhook received:", JSON.stringify(body));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check the event type
    const eventType = body.event || body.type;
    const paymentData = body.data;

    if (!paymentData) {
      console.log("No payment data in webhook");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = paymentData.id;
    const status = paymentData.status;
    const metadata = paymentData.metadata || {};

    console.log(`Processing payment ${paymentId} with status ${status}`);

    // Update payment status
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({ 
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("moneroo_payment_id", paymentId);

    if (paymentUpdateError) {
      console.error("Error updating payment:", paymentUpdateError);
    }

    // If payment is successful, activate the subscription
    if (status === "success" || status === "paid" || status === "completed") {
      const userId = metadata.user_id;
      const plan = metadata.plan;

      if (userId && plan) {
        console.log(`Activating ${plan} subscription for user ${userId}`);

        // Calculate expiry date (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Check if user already has a subscription
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (existingSub) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              plan: plan,
              status: "active",
              payment_id: paymentId,
              amount: paymentData.amount / 100,
              currency: paymentData.currency?.code || "EUR",
              started_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating subscription:", updateError);
          } else {
            console.log(`Subscription updated for user ${userId}`);
          }
        } else {
          // Create new subscription
          const { error: insertError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan: plan,
              status: "active",
              payment_id: paymentId,
              amount: paymentData.amount / 100,
              currency: paymentData.currency?.code || "EUR",
              started_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            });

          if (insertError) {
            console.error("Error creating subscription:", insertError);
          } else {
            console.log(`Subscription created for user ${userId}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true, status: status }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
