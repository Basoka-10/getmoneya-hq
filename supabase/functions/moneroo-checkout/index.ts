import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// URL de production fixe - NE PAS utiliser req.headers.get("origin")
const RETURN_URL_BASE = "https://getmoneya.pro";

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
  console.log("=== MONEROO CHECKOUT START ===");
  console.log("Method:", req.method);
  
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
    console.log("Request data:", { plan, userId, userEmail, userName });

    if (!plan || !userId || !userEmail) {
      throw new Error("Paramètres manquants: plan, userId, userEmail requis");
    }

    // Determine amount based on plan in XOF (FCFA) - integer amounts, no decimals
    const amounts: Record<string, number> = {
      pro: 2000, // 2000 FCFA
      business: 4500, // 4500 FCFA
    };

    const amount = amounts[plan];
    if (!amount) {
      throw new Error("Plan invalide");
    }

    console.log(`Creating Moneroo payment for plan: ${plan}, user: ${userEmail}, amount: ${amount} XOF`);
    console.log(`Return URL base: ${RETURN_URL_BASE}`);

    // Préparer l'URL de retour - Moneroo ajoutera ses propres paramètres
    const returnUrl = `${RETURN_URL_BASE}/payment-success?plan=${plan}&user_id=${userId}`;
    console.log("Return URL for Moneroo:", returnUrl);

    // Initialize Moneroo payment
    const monerooPayload = {
      amount: amount,
      currency: "XOF",
      description: `Abonnement Moneya ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
      customer: {
        email: userEmail,
        first_name: userName?.split(" ")[0] || "Client",
        last_name: userName?.split(" ").slice(1).join(" ") || "Moneya",
      },
      return_url: returnUrl,
      metadata: {
        plan: plan,
        user_id: userId,
        user_email: userEmail,
      },
    };

    console.log("Moneroo request payload:", JSON.stringify(monerooPayload, null, 2));

    const monerooResponse = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MONEROO_SECRET_KEY}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(monerooPayload),
    });

    const monerooData: MonerooResponse = await monerooResponse.json();
    console.log("Moneroo response status:", monerooResponse.status);
    console.log("Moneroo response:", JSON.stringify(monerooData, null, 2));

    if (!monerooResponse.ok) {
      console.error("Moneroo error:", monerooData);
      throw new Error(monerooData.message || "Erreur Moneroo");
    }

    const paymentId = monerooData.data?.id || "unknown";
    console.log("Payment ID from Moneroo:", paymentId);

    // Store payment record in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase.from("payments").insert({
      user_id: userId,
      moneroo_payment_id: paymentId,
      amount: amount,
      currency: "XOF",
      status: "pending",
      plan: plan,
      metadata: monerooData.data,
    });

    if (insertError) {
      console.error("Error storing payment:", insertError);
    } else {
      console.log("Payment record stored successfully");
    }

    // Return checkout URL with paymentId included for the frontend
    const checkoutUrl = monerooData.data?.checkout_url;
    const returnUrlWithPaymentId = `${RETURN_URL_BASE}/payment-success?plan=${plan}&user_id=${userId}&paymentId=${paymentId}`;

    console.log("Checkout URL:", checkoutUrl);
    console.log("Return URL with payment ID:", returnUrlWithPaymentId);
    console.log("=== MONEROO CHECKOUT SUCCESS ===");

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
    console.error("=== MONEROO CHECKOUT ERROR ===");
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
