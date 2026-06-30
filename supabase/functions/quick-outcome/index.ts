import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as djwt from "https://deno.land/x/djwt@v3.0.2/mod.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const result = url.searchParams.get("result");

    if (!token || !result) {
      return new Response(htmlPage("Missing Parameters", "Invalid link. Please use the link from your email."), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const validResults = ["right_call", "mostly_right", "mixed", "mostly_wrong", "wrong_call"];
    if (!validResults.includes(result)) {
      return new Response(htmlPage("Invalid Result", "Invalid outcome value."), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Verify JWT with dedicated quick-outcome secret (separate from service role key)
    const secret =
      Deno.env.get("QUICK_OUTCOME_SECRET") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    let payload: any;
    try {
      payload = await djwt.verify(token, key);
    } catch (e) {
      return new Response(htmlPage("Link Expired", "This link has expired. Please check your latest email or log the outcome in the app."), {
        status: 401,
        headers: { "Content-Type": "text/html" },
      });
    }

    const { user_id, decision_id, team_id } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if outcome already exists
    const { data: existing } = await adminClient
      .from("team_outcomes")
      .select("id")
      .eq("decision_id", decision_id)
      .maybeSingle();

    if (existing) {
      return new Response(htmlPage("Already Logged", "An outcome has already been recorded for this decision. Visit the app to update it."), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Create outcome
    const { error: outcomeError } = await adminClient.from("team_outcomes").insert({
      decision_id,
      team_id,
      user_id,
      result,
      satisfaction: 5, // Neutral default
      what_happened: `Quick outcome logged via email: ${result.replace(/_/g, " ")}`,
    });

    if (outcomeError) {
      console.error("Failed to create outcome:", outcomeError);
      return new Response(htmlPage("Error", "Something went wrong. Please try again in the app."), {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Update decision status
    await adminClient
      .from("team_decisions")
      .update({ status: "completed" })
      .eq("id", decision_id);

    const resultLabel: Record<string, string> = {
      right_call: "✅ Right Call",
      mostly_right: "👍 Mostly Right",
      mixed: "🤷 Mixed",
      mostly_wrong: "👎 Mostly Wrong",
      wrong_call: "❌ Wrong Call",
    };

    return new Response(
      htmlPage(
        "Outcome Logged!",
        `You recorded: <strong>${resultLabel[result] || result}</strong><br><br>Want to add more details?<br><br><a href="https://snagme.app/team" style="display:inline-block;padding:12px 28px;background:#BE3455;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Open Snag</a>`
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Quick outcome error:", error);
    return new Response(htmlPage("Error", "Something went wrong."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
});

function htmlPage(title: string, body: string): string {
  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title} - Snag</title>
    <style>
      body{margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;text-align:center;}
      .card{max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
      h1{color:#1A1A1A;font-size:24px;margin-bottom:16px;}
      p{color:#666;font-size:15px;line-height:1.6;}
      .logo{font-size:20px;font-weight:700;color:#BE3455;margin-bottom:24px;}
    </style>
  </head><body>
    <div class="card">
      <div class="logo">SNAG</div>
      <h1>${title}</h1>
      <p>${body}</p>
    </div>
  </body></html>`;
}
