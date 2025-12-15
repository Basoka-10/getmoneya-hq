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
    const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');
    
    if (!apiKey) {
      console.error('EXCHANGE_RATE_API_KEY not configured');
      throw new Error('Exchange rate API key not configured');
    }

    console.log('Fetching exchange rates from ExchangeRate API...');
    
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/EUR`
    );

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Exchange rates fetched successfully');

    // Return only the rates we need
    const rates = {
      result: data.result,
      rates: {
        EUR: 1,
        USD: data.conversion_rates?.USD,
        XOF: data.conversion_rates?.XOF,
      }
    };

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
