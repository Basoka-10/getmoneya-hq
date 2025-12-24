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
    const { payment_id, user_id, plan } = await req.json();
    console.log(`Verifying payment ${payment_id} for user ${user_id}, plan ${plan}`);

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

    // First, check if we already have a successful payment in database
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("moneroo_payment_id", payment_id)
      .single();

    console.log("Existing payment in DB:", existingPayment);

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .single();

    console.log("Existing subscription:", existingSubscription);

    // If subscription is already active with this plan, return success
    if (existingSubscription?.status === "active" && existingSubscription?.plan === plan) {
      console.log("Subscription already active");
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "active",
          subscription: existingSubscription 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify payment status with Moneroo API
    let paymentStatus = existingPayment?.status;
    
    if (payment_id && (!paymentStatus || paymentStatus === "pending")) {
      try {
        console.log("Checking Moneroo API for payment status...");
        const monerooResponse = await fetch(`https://api.moneroo.io/v1/payments/${payment_id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${monerooSecretKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        if (monerooResponse.ok) {
          const monerooData = await monerooResponse.json();
          console.log("Moneroo payment data:", JSON.stringify(monerooData));
          
          paymentStatus = monerooData.data?.status || monerooData.status;
          console.log("Payment status from Moneroo:", paymentStatus);

          // Update payment status in our database
          if (paymentStatus) {
            await supabase
              .from("payments")
              .update({ 
                status: paymentStatus,
                updated_at: new Date().toISOString()
              })
              .eq("moneroo_payment_id", payment_id);
          }
        } else {
          console.error("Moneroo API error:", monerooResponse.status, await monerooResponse.text());
        }
      } catch (apiError) {
        console.error("Error calling Moneroo API:", apiError);
      }
    }

    // If payment is successful, activate subscription
    const successStatuses = ["success", "paid", "completed", "successful"];
    if (paymentStatus && successStatuses.includes(paymentStatus.toLowerCase())) {
      console.log(`Payment verified as ${paymentStatus}, activating subscription...`);

      // Calculate expiry date (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const subscriptionData = {
        user_id: user_id,
        plan: plan,
        status: "active",
        payment_id: payment_id,
        amount: existingPayment?.amount || (plan === "business" ? 17 : 7),
        currency: existingPayment?.currency || "EUR",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      };

      let subscriptionResult;
      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from("subscriptions")
          .update(subscriptionData)
          .eq("user_id", user_id)
          .select()
          .single();
        
        subscriptionResult = { data, error };
      } else {
        // Create new subscription
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

      console.log("Subscription activated successfully:", subscriptionResult.data);
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "active",
          subscription: subscriptionResult.data 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payment not yet confirmed
    console.log(`Payment status is ${paymentStatus}, not activating`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        status: paymentStatus || "pending",
        message: "Payment not yet confirmed" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(
      JSON.stringify({ error: "Payment verification failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
