import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_ADDRESS = Deno.env.get("EMAIL_FROM_ADDRESS") || "hello@snagme.app";
const TO_ADDRESS = "mahesh@roarrglobal.com";

interface Payload {
  scan_session_id: string;
  binding_constraint_name: string;
  binding_constraint_score: number;
  total_financial_impact: number;
  arr: number;
  email: string;
}

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Payload;

    if (!body?.scan_session_id || !body?.binding_constraint_name) {
      return new Response(JSON.stringify({ error: "invalid_payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `Nerve Scan — New diagnostic completed: ${body.binding_constraint_name}`;
    const text = `New Scan diagnostic completed.

Email: ${body.email}
ARR: ${fmtMoney(body.arr)}
Binding constraint: ${body.binding_constraint_name} (Score: ${body.binding_constraint_score}/25)
Estimated annual impact: ${fmtMoney(body.total_financial_impact)}
Session ID: ${body.scan_session_id}

View session in Supabase dashboard.`;

    if (!RESEND_API_KEY) {
      console.log("[scan-notification] RESEND_API_KEY missing — logging only");
      console.log(subject);
      console.log(text);
      return new Response(JSON.stringify({ ok: true, sent: false, reason: "no_resend_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Nerve Scan <${FROM_ADDRESS}>`,
        to: [TO_ADDRESS],
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[scan-notification] resend error", res.status, err);
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[scan-notification] unexpected", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
