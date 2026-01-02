import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

interface SaleRequest {
  amount: number;
  currency?: string;
  category: string;
  source: string;
  date?: string;
  description?: string;
  client_email?: string;
  client_phone?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get API key from header
  const apiKey = req.headers.get("x-api-key");
  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

  if (!apiKey) {
    console.log("[api-sales] Missing API key");
    return new Response(
      JSON.stringify({ error: "API key required", code: "MISSING_API_KEY" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Hash the API key to compare
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  // Find API key in database
  const { data: apiKeyData, error: keyError } = await supabase
    .from("api_keys")
    .select("id, user_id, is_active")
    .eq("key_hash", keyHash)
    .single();

  if (keyError || !apiKeyData) {
    console.log("[api-sales] Invalid API key:", keyError?.message);
    return new Response(
      JSON.stringify({ error: "Invalid API key", code: "INVALID_API_KEY" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!apiKeyData.is_active) {
    console.log("[api-sales] API key is disabled");
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/sales", "POST", null, 403, "API key disabled", ipAddress, null, Date.now() - startTime);
    return new Response(
      JSON.stringify({ error: "API key is disabled", code: "KEY_DISABLED" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check user limits
  const { data: limits } = await supabase.rpc("get_user_api_limits", { _user_id: apiKeyData.user_id });
  const { data: salesCount } = await supabase.rpc("get_api_sales_this_month", { _user_id: apiKeyData.user_id });

  const userLimits = limits?.[0] || { max_sales_per_month: 50 };
  const currentSales = salesCount || 0;

  if (currentSales >= userLimits.max_sales_per_month) {
    console.log(`[api-sales] Quota exceeded: ${currentSales}/${userLimits.max_sales_per_month}`);
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/sales", "POST", null, 429, "Monthly quota exceeded", ipAddress, null, Date.now() - startTime);
    return new Response(
      JSON.stringify({ 
        error: "Monthly quota exceeded", 
        code: "QUOTA_EXCEEDED",
        current: currentSales,
        limit: userLimits.max_sales_per_month
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Parse request body
  let body: SaleRequest;
  try {
    body = await req.json();
  } catch {
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/sales", "POST", null, 400, "Invalid JSON", ipAddress, null, Date.now() - startTime);
    return new Response(
      JSON.stringify({ error: "Invalid JSON body", code: "INVALID_JSON" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate required fields
  if (!body.amount || !body.category || !body.source) {
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/sales", "POST", body.source, 400, "Missing required fields", ipAddress, body, Date.now() - startTime);
    return new Response(
      JSON.stringify({ 
        error: "Missing required fields", 
        code: "VALIDATION_ERROR",
        required: ["amount", "category", "source"]
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (typeof body.amount !== "number" || body.amount <= 0) {
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/sales", "POST", body.source, 400, "Invalid amount", ipAddress, body, Date.now() - startTime);
    return new Response(
      JSON.stringify({ error: "Amount must be a positive number", code: "INVALID_AMOUNT" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Create the transaction (sale = income)
  const transactionDate = body.date || new Date().toISOString().split("T")[0];
  const description = body.description || `Vente ${body.source} - ${body.category}`;

  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: apiKeyData.user_id,
      type: "income",
      amount: body.amount,
      category: body.category,
      description: description,
      date: transactionDate,
    })
    .select()
    .single();

  if (txError) {
    console.error("[api-sales] Error creating transaction:", txError);
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/sales", "POST", body.source, 500, txError.message, ipAddress, body, Date.now() - startTime);
    return new Response(
      JSON.stringify({ error: "Failed to create sale", code: "DB_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update last_used_at on API key
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", apiKeyData.id);

  // Log successful call
  await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/sales", "POST", body.source, 200, null, ipAddress, body, Date.now() - startTime);

  console.log(`[api-sales] Sale created: ${transaction.id} for user ${apiKeyData.user_id}`);

  return new Response(
    JSON.stringify({
      success: true,
      sale: {
        id: transaction.id,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        source: body.source,
      },
      quota: {
        used: currentSales + 1,
        limit: userLimits.max_sales_per_month,
        remaining: userLimits.max_sales_per_month - currentSales - 1,
      }
    }),
    { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

async function logApiCall(
  supabase: any,
  userId: string,
  apiKeyId: string,
  endpoint: string,
  method: string,
  source: string | null,
  statusCode: number,
  errorMessage: string | null,
  ipAddress: string,
  requestBody: any,
  responseTimeMs: number
) {
  try {
    await supabase.from("api_logs").insert({
      user_id: userId,
      api_key_id: apiKeyId,
      endpoint,
      method,
      source,
      status_code: statusCode,
      error_message: errorMessage,
      ip_address: ipAddress,
      request_body: requestBody ? JSON.stringify(requestBody) : null,
      response_time_ms: responseTimeMs,
    });
  } catch (err) {
    console.error("[api-sales] Failed to log API call:", err);
  }
}
