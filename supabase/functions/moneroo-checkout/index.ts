import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  plan: "pro" | "business";
  userId: string;
  userEmail: string;
  userName?: string;
}

interface MonerooResponse {
  data?: {
    id: string;
    checkout_url: string;
  };
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MONEROO_SECRET_KEY = Deno.env.get("MONEROO_SECRET_KEY");
    if (!MONEROO_SECRET_KEY) {
      console.error("MONEROO_SECRET_KEY not configured");
      throw new Error("Configuration de paiement manquante");
    }

    const { plan, userId, userEmail, userName } = await req.json() as CheckoutRequest;

    if (!plan || !userId || !userEmail) {
      throw new Error("Paramètres manquants: plan, userId, userEmail requis");
    }

    // Determine amount based on plan (in EUR - Moneroo expects amount in main currency unit, not cents)
    const amounts: Record<string, number> = {
      pro: 7, // 7€
      business: 17, // 17€
    };

    const amount = amounts[plan];
    if (!amount) {
      throw new Error("Plan invalide");
    }

    console.log(`Creating Moneroo payment for plan: ${plan}, user: ${userEmail}, amount: ${amount} EUR`);

    // Get the base URL for redirects
    const origin = req.headers.get("origin") || "https://fisjgmjnezcchxnhihxc.lovableproject.com";

    // Initialize Moneroo payment
    const monerooResponse = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MONEROO_SECRET_KEY}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "EUR",
        description: `Abonnement FreelanceBox ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
        customer: {
          email: userEmail,
          first_name: userName?.split(" ")[0] || "Client",
          last_name: userName?.split(" ").slice(1).join(" ") || "FreelanceBox",
        },
        return_url: `${origin}/payment-success?plan=${plan}&user_id=${userId}`,
        metadata: {
          plan: plan,
          user_id: userId,
          user_email: userEmail,
        },
      }),
    });

    const monerooData: MonerooResponse = await monerooResponse.json();
    console.log("Moneroo response:", JSON.stringify(monerooData));

    if (!monerooResponse.ok) {
      console.error("Moneroo error:", monerooData);
      throw new Error(monerooData.message || "Erreur Moneroo");
    }

    const paymentId = monerooData.data?.id || "unknown";

    // Store payment record in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase.from("payments").insert({
      user_id: userId,
      moneroo_payment_id: paymentId,
      amount: amount,
      currency: "EUR",
      status: "pending",
      plan: plan,
      metadata: monerooData.data,
    });

    if (insertError) {
      console.error("Error storing payment:", insertError);
    }

    // Return checkout URL with paymentId included
    const checkoutUrl = monerooData.data?.checkout_url;
    const returnUrlWithPaymentId = `${origin}/payment-success?plan=${plan}&user_id=${userId}&paymentId=${paymentId}`;

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutUrl,
        payment_id: paymentId,
        return_url: returnUrlWithPaymentId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
