import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching exchange rates...');

    const appId = Deno.env.get('OPEN_EXCHANGE_RATES_APP_ID');
    
    if (!appId) {
      console.error('OPEN_EXCHANGE_RATES_APP_ID not configured');
      throw new Error('Open Exchange Rates App ID not configured');
    }

    console.log('Fetching exchange rates from Open Exchange Rates API...');
    
    // Open Exchange Rates uses USD as base currency (free plan)
    // Include GNF (Guinean Franc)
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${appId}&symbols=EUR,USD,XOF,GNF`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Open Exchange Rates response:', JSON.stringify(data));

    if (!data.rates) {
      throw new Error('Invalid API response: missing rates');
    }

    // Open Exchange Rates returns rates with USD as base
    // We need to convert to EUR as base for our app
    const usdToEur = data.rates.EUR;
    const usdToXof = data.rates.XOF;
    const usdToGnf = data.rates.GNF;

    if (!usdToEur || !usdToXof) {
      throw new Error('Missing required exchange rates in response');
    }

    // Convert rates to EUR as base currency
    // If 1 USD = X EUR, then 1 EUR = 1/X USD
    const eurToUsd = 1 / usdToEur;
    const eurToXof = usdToXof / usdToEur;
    const eurToGnf = usdToGnf ? usdToGnf / usdToEur : 9200; // Fallback rate for GNF

    const rates = {
      result: 'success',
      base: 'EUR',
      rates: {
        EUR: 1,
        USD: Number(eurToUsd.toFixed(6)),
        XOF: Number(eurToXof.toFixed(2)),
        GNF: Number(eurToGnf.toFixed(0)),
      }
    };

    console.log('Converted rates (EUR base):', JSON.stringify(rates));

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching exchange rates:', errorMessage);
    return new Response(JSON.stringify({ 
      result: 'error',
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});