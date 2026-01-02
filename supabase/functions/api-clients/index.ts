import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

interface ClientRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  status?: "active" | "prospect" | "former";
  source?: string;
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
    console.log("[api-clients] Missing API key");
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
    console.log("[api-clients] Invalid API key:", keyError?.message);
    return new Response(
      JSON.stringify({ error: "Invalid API key", code: "INVALID_API_KEY" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!apiKeyData.is_active) {
    console.log("[api-clients] API key is disabled");
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/clients", "POST", null, 403, "API key disabled", ipAddress, null, Date.now() - startTime);
    return new Response(
      JSON.stringify({ error: "API key is disabled", code: "KEY_DISABLED" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check user plan - only pro and business can create clients via API
  const { data: limits } = await supabase.rpc("get_user_api_limits", { _user_id: apiKeyData.user_id });
  const userLimits = limits?.[0] || { plan: "free" };

  if (userLimits.plan === "free") {
    console.log("[api-clients] Free plan cannot create clients via API");
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/clients", "POST", null, 403, "Upgrade required", ipAddress, null, Date.now() - startTime);
    return new Response(
      JSON.stringify({ 
        error: "Client API requires Pro or Business plan", 
        code: "UPGRADE_REQUIRED",
        upgrade_url: "https://moneya.app/pricing"
      }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Parse request body
  let body: ClientRequest;
  try {
    body = await req.json();
  } catch {
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/clients", "POST", null, 400, "Invalid JSON", ipAddress, null, Date.now() - startTime);
    return new Response(
      JSON.stringify({ error: "Invalid JSON body", code: "INVALID_JSON" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate required fields
  if (!body.name) {
    await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/clients", "POST", body.source, 400, "Missing name", ipAddress, body, Date.now() - startTime);
    return new Response(
      JSON.stringify({ 
        error: "Client name is required", 
        code: "VALIDATION_ERROR",
        required: ["name"]
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if client already exists (by email or phone)
  let existingClient = null;
  
  if (body.email) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", apiKeyData.user_id)
      .eq("email", body.email)
      .single();
    existingClient = data;
  }
  
  if (!existingClient && body.phone) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", apiKeyData.user_id)
      .eq("phone", body.phone)
      .single();
    existingClient = data;
  }

  let client;
  let isNew = false;

  if (existingClient) {
    // Update existing client
    const { data, error } = await supabase
      .from("clients")
      .update({
        name: body.name,
        email: body.email || existingClient.email,
        phone: body.phone || existingClient.phone,
        company: body.company || existingClient.company,
        notes: body.notes ? `${existingClient.notes || ""}\n${body.notes}`.trim() : existingClient.notes,
        status: body.status || existingClient.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingClient.id)
      .select()
      .single();

    if (error) {
      console.error("[api-clients] Error updating client:", error);
      await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/clients", "POST", body.source, 500, error.message, ipAddress, body, Date.now() - startTime);
      return new Response(
        JSON.stringify({ error: "Failed to update client", code: "DB_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    client = data;
    console.log(`[api-clients] Client updated: ${client.id}`);
  } else {
    // Create new client
    const { data, error } = await supabase
      .from("clients")
      .insert({
        user_id: apiKeyData.user_id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        notes: body.notes,
        status: body.status || "active",
      })
      .select()
      .single();

    if (error) {
      console.error("[api-clients] Error creating client:", error);
      await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/clients", "POST", body.source, 500, error.message, ipAddress, body, Date.now() - startTime);
      return new Response(
        JSON.stringify({ error: "Failed to create client", code: "DB_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    client = data;
    isNew = true;
    console.log(`[api-clients] Client created: ${client.id}`);
  }

  // Update last_used_at on API key
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", apiKeyData.id);

  // Log successful call
  await logApiCall(supabase, apiKeyData.user_id, apiKeyData.id, "/api/v1/clients", "POST", body.source, isNew ? 201 : 200, null, ipAddress, body, Date.now() - startTime);

  return new Response(
    JSON.stringify({
      success: true,
      action: isNew ? "created" : "updated",
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        status: client.status,
      }
    }),
    { status: isNew ? 201 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

async function logApiCall(
  supabase: any,
  userId: string,
  apiKeyId: string,
  endpoint: string,
  method: string,
  source: string | null | undefined,
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
      source: source || null,
      status_code: statusCode,
      error_message: errorMessage,
      ip_address: ipAddress,
      request_body: requestBody ? JSON.stringify(requestBody) : null,
      response_time_ms: responseTimeMs,
    });
  } catch (err) {
    console.error("[api-clients] Failed to log API call:", err);
  }
}
