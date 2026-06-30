import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WINDOW_MINUTES = 60;
const MAX_VIEWS_PER_WINDOW_PER_IP = 5;

async function hashIp(ip: string): Promise<string> {
  const salt = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "salt";
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { short_code } = await req.json().catch(() => ({}));
    if (typeof short_code !== "string" || !/^[a-z0-9]{4,32}$/.test(short_code)) {
      return new Response(JSON.stringify({ error: "invalid short_code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "0.0.0.0";
    const ipHash = await hashIp(ip);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: count recent views from this IP for this short_code
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await admin
      .from("shared_snag_views")
      .select("*", { count: "exact", head: true })
      .eq("short_code", short_code)
      .eq("viewer_ip_hash", ipHash)
      .gte("viewed_at", since);

    if ((count ?? 0) >= MAX_VIEWS_PER_WINDOW_PER_IP) {
      return new Response(JSON.stringify({ counted: false, rate_limited: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify share exists
    const { data: shared } = await admin
      .from("shared_snags")
      .select("id, view_count")
      .eq("short_code", short_code)
      .maybeSingle();
    if (!shared) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("shared_snag_views").insert({
      short_code,
      viewer_ip_hash: ipHash,
    });

    await admin
      .from("shared_snags")
      .update({ view_count: (shared.view_count ?? 0) + 1 })
      .eq("id", shared.id);

    return new Response(JSON.stringify({ counted: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("share-view error:", err);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
