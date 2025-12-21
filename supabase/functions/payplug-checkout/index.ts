import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  plan: "pro" | "business";
  userEmail: string;
  userName?: string;
}

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  pro: { amount: 700, name: "MONEYA Pro - 7€/mois" },
  business: { amount: 1700, name: "MONEYA Business - 17€/mois" },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYPLUG_API_KEY = Deno.env.get("PAYPLUG_API_KEY");
    
    if (!PAYPLUG_API_KEY) {
      console.error("PAYPLUG_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { plan, userEmail, userName } = await req.json() as CheckoutRequest;

    if (!plan || !PLAN_PRICES[plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planDetails = PLAN_PRICES[plan];
    const origin = req.headers.get("origin") || "https://moneya.app";

    // Create PayPlug payment
    const paymentData = {
      amount: planDetails.amount,
      currency: "EUR",
      billing: {
        email: userEmail,
        first_name: userName?.split(" ")[0] || "Client",
        last_name: userName?.split(" ").slice(1).join(" ") || "MONEYA",
        address1: "Non renseignée",
        postcode: "00000",
        city: "Non renseignée",
        country: "FR",
        language: "fr",
      },
      shipping: {
        email: userEmail,
        first_name: userName?.split(" ")[0] || "Client",
        last_name: userName?.split(" ").slice(1).join(" ") || "MONEYA",
        address1: "Non renseignée",
        postcode: "00000",
        city: "Non renseignée",
        country: "FR",
        language: "fr",
        delivery_type: "DIGITAL_GOODS",
      },
      hosted_payment: {
        return_url: `${origin}/settings?payment=success&plan=${plan}`,
        cancel_url: `${origin}/settings?payment=cancelled`,
      },
      notification_url: `${origin}/api/payplug-webhook`,
      metadata: {
        plan,
        user_email: userEmail,
      },
      description: planDetails.name,
    };

    console.log("Creating PayPlug payment:", JSON.stringify(paymentData, null, 2));

    const response = await fetch("https://api.payplug.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYPLUG_API_KEY}`,
        "Content-Type": "application/json",
        "PayPlug-Version": "2019-08-06",
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("PayPlug error:", JSON.stringify(result, null, 2));
      return new Response(
        JSON.stringify({ 
          error: "Payment creation failed", 
          details: result.message || "Unknown error" 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("PayPlug payment created:", result.id);

    return new Response(
      JSON.stringify({
        payment_url: result.hosted_payment?.payment_url,
        payment_id: result.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
