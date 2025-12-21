import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ExchangeRates = Record<string, number>;

const parseCurrenciesSetting = (value: unknown): string[] => {
  try {
    if (Array.isArray(value)) return value.map((v) => String(v));
    if (typeof value === "string") return JSON.parse(value);
    return [];
  } catch (e) {
    console.log("[exchange-rates] Failed to parse supported currencies", e);
    return [];
  }
};

const roundRate = (rate: number) => {
  // Keep enough precision for FX while staying readable
  if (rate >= 1000) return Number(rate.toFixed(0));
  if (rate >= 100) return Number(rate.toFixed(2));
  return Number(rate.toFixed(6));
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[exchange-rates] Fetching exchange rates...");

    const appId = Deno.env.get("OPEN_EXCHANGE_RATES_APP_ID");
    if (!appId) {
      console.error("[exchange-rates] OPEN_EXCHANGE_RATES_APP_ID not configured");
      throw new Error("Open Exchange Rates App ID not configured");
    }

    // Fetch supported currencies dynamically (admin-managed)
    let supportedCurrencies: string[] = ["EUR", "USD", "XOF", "GNF"];

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });

        const { data, error } = await supabase
          .from("system_settings")
          .select("setting_value")
          .eq("setting_key", "supported_currencies")
          .maybeSingle();

        if (error) throw error;

        const currenciesFromDb = parseCurrenciesSetting(data?.setting_value);
        if (currenciesFromDb.length > 0) {
          supportedCurrencies = currenciesFromDb;
        }

        console.log("[exchange-rates] Supported currencies:", supportedCurrencies.join(", "));
      } catch (e) {
        console.log("[exchange-rates] Could not fetch supported currencies from DB, using fallback", e);
      }
    } else {
      console.log("[exchange-rates] Supabase env missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY), using fallback");
    }

    const symbols = Array.from(new Set(["EUR", "USD", ...supportedCurrencies]))
      .map((c) => String(c).toUpperCase())
      .filter(Boolean);

    console.log("[exchange-rates] Requesting symbols:", symbols.join(","));

    // Open Exchange Rates free plan uses USD as base
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${appId}&symbols=${encodeURIComponent(symbols.join(","))}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[exchange-rates] API Error: ${response.status} - ${errorText}`);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[exchange-rates] Open Exchange Rates response:", JSON.stringify({
      base: data?.base,
      timestamp: data?.timestamp,
      ratesKeys: Object.keys(data?.rates ?? {}),
    }));

    if (!data?.rates) {
      throw new Error("Invalid API response: missing rates");
    }

    const usdToEur = data.rates.EUR;
    if (!usdToEur || typeof usdToEur !== "number") {
      throw new Error("Missing required EUR rate in response");
    }

    // Convert all requested currencies to EUR as base
    const eurRates: ExchangeRates = { EUR: 1 };

    for (const code of symbols) {
      if (code === "EUR") continue;
      const usdToTarget = data.rates[code];
      if (typeof usdToTarget !== "number") continue;

      const eurToTarget = usdToTarget / usdToEur;
      eurRates[code] = roundRate(eurToTarget);
    }

    const payload = {
      result: "success",
      base: "EUR",
      rates: eurRates,
    };

    console.log("[exchange-rates] Converted rates (EUR base) keys:", Object.keys(eurRates).join(","));

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[exchange-rates] Error:", errorMessage);

    return new Response(
      JSON.stringify({
        result: "error",
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
