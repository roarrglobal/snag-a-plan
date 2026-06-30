// Unified admin endpoint: data fetch + privileged actions.
// All requests require a logged-in user whose nerve_user_profiles.is_admin = true.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { resolveSiteUrl } from "../_shared/site-url.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const MODULE_LABEL: Record<string, string> = {
  scan: "Scan",
  zero: "ZERO",
  snag: "SNAG",
  pulse: "Pulse",
};
const MODULE_ROUTE: Record<string, string> = {
  scan: "/scan",
  zero: "/zero",
  snag: "/analyze",
  pulse: "/pulse",
};
const MODULE_FIRST_STEP: Record<string, string> = {
  scan:
    "Run your first eight-pillar diagnostic. It takes about 20 minutes and identifies the single constraint costing your revenue system the most.",
  zero:
    "Start a new belief examination. Describe the decision your team is about to make.",
  snag:
    "Gate your next major revenue commitment. Describe the motion before you commit resources.",
  pulse:
    "Connect your pipeline data so Pulse can begin monitoring deal health and execution decay.",
};

async function sendActivationEmail(opts: {
  email: string;
  firstName: string;
  module: string;
  appOrigin: string;
}) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddress = Deno.env.get("EMAIL_FROM_ADDRESS") || "Nerve <hello@snagme.app>";
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping activation email");
    return { skipped: true };
  }
  const label = MODULE_LABEL[opts.module] ?? opts.module;
  const subject = `Your ${label} access is activated`;
  const text = `Hi ${opts.firstName || "there"},

Your access to Nerve ${label} has been activated.

Sign in to get started:
${opts.appOrigin}${MODULE_ROUTE[opts.module] ?? "/dashboard"}

What to do first:
${MODULE_FIRST_STEP[opts.module] ?? ""}

If you have any questions, reply to this email directly.

— Mahesh Iyer
Nerve | Revenue Execution Governance
mahesh@roarrglobal.com
`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromAddress, to: [opts.email], subject, text }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error("Activation email failed", res.status, detail);
    return { error: detail };
  }
  return { ok: true };
}

async function sendIntakeScheduledEmail(opts: {
  email: string;
  firstName: string;
  calendlyUrl: string;
}) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddress = Deno.env.get("EMAIL_FROM_ADDRESS") || "Nerve <hello@snagme.app>";
  if (!resendKey) return { skipped: true };
  const subject = "Your Nerve intake conversation is scheduled";
  const text = `Hi ${opts.firstName || "there"},

We have reviewed your request and would like to learn more about your situation. Please book a time:

${opts.calendlyUrl}

— Mahesh Iyer, Nerve
`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromAddress, to: [opts.email], subject, text }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error("Intake email failed", res.status, detail);
    return { error: detail };
  }
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "missing_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const adminId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify admin
    const { data: meRow } = await admin
      .from("nerve_user_profiles")
      .select("is_admin, full_name")
      .eq("id", adminId)
      .maybeSingle();
    if (!meRow?.is_admin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "GET" ? {} : await req.json().catch(() => ({}));
    const action = (body?.action ?? "fetch") as string;

    const site = resolveSiteUrl(req);
    if (site.warnings.length) console.warn("nerve-admin site resolution:", site.warnings);
    const origin = site.origin;

    async function fetchEmail(uid: string): Promise<string | null> {
      const { data } = await admin.auth.admin.getUserById(uid);
      return data.user?.email ?? null;
    }

    if (action === "fetch") {
      const [profiles, access, intakes] = await Promise.all([
        admin.from("nerve_user_profiles").select("*").order("created_at", { ascending: false }),
        admin.from("nerve_module_access").select("*").order("requested_at", { ascending: false }),
        admin.from("nerve_intake_forms").select("*").order("submitted_at", { ascending: false }),
      ]);

      // Page through users to attach emails
      const emailMap: Record<string, string> = {};
      let page = 1;
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        for (const u of data.users) if (u.email) emailMap[u.id] = u.email;
        if (data.users.length < 200) break;
        page++;
        if (page > 25) break;
      }

      return new Response(
        JSON.stringify({
          profiles: profiles.data ?? [],
          access: access.data ?? [],
          intakes: intakes.data ?? [],
          emails: emailMap,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "reset_unread") {
      await admin
        .from("nerve_user_profiles")
        .update({ unread_admin_notifications: 0 })
        .eq("id", adminId);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_profile") {
      const { target_user_id, patch } = body;
      const allowed: Record<string, unknown> = {};
      for (const k of [
        "full_name",
        "company_name",
        "job_title",
        "team_size",
        "primary_module",
        "onboarding_status",
        "calendly_url",
        "notes",
      ]) {
        if (k in (patch ?? {})) allowed[k] = patch[k];
      }
      const { error } = await admin
        .from("nerve_user_profiles")
        .update(allowed)
        .eq("id", target_user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "schedule_intake") {
      const { target_user_id, calendly_url } = body;
      const { data: profile } = await admin
        .from("nerve_user_profiles")
        .select("full_name")
        .eq("id", target_user_id)
        .maybeSingle();
      await admin
        .from("nerve_user_profiles")
        .update({
          onboarding_status: "intake_scheduled",
          calendly_url: calendly_url ?? null,
        })
        .eq("id", target_user_id);

      const email = await fetchEmail(target_user_id);
      let mail = null;
      if (email && calendly_url) {
        mail = await sendIntakeScheduledEmail({
          email,
          firstName: (profile?.full_name ?? "").split(" ")[0] ?? "",
          calendlyUrl: calendly_url,
        });
      }
      return new Response(JSON.stringify({ ok: true, email: mail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mark_intake_complete") {
      const { target_user_id } = body;
      await admin
        .from("nerve_user_profiles")
        .update({ onboarding_status: "intake_complete" })
        .eq("id", target_user_id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mark_intake_reviewed") {
      const { intake_id } = body;
      await admin
        .from("nerve_intake_forms")
        .update({ reviewed_by: adminId, reviewed_at: new Date().toISOString() })
        .eq("id", intake_id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "activate_module") {
      const { target_user_id, module, trial_until } = body as {
        target_user_id: string;
        module: string;
        trial_until?: string | null;
      };
      const status = trial_until ? "trial" : "active";
      const { data: existing } = await admin
        .from("nerve_module_access")
        .select("id")
        .eq("user_id", target_user_id)
        .eq("module", module)
        .maybeSingle();

      if (existing) {
        await admin
          .from("nerve_module_access")
          .update({
            status,
            activated_at: new Date().toISOString(),
            activated_by: adminId,
            trial_expires_at: trial_until ?? null,
          })
          .eq("id", existing.id);
      } else {
        await admin.from("nerve_module_access").insert({
          user_id: target_user_id,
          module,
          status,
          activated_at: new Date().toISOString(),
          activated_by: adminId,
          trial_expires_at: trial_until ?? null,
        });
      }

      // If at least one module is active, flip onboarding_status to 'active'
      await admin
        .from("nerve_user_profiles")
        .update({ onboarding_status: "active" })
        .eq("id", target_user_id);

      const [{ data: profile }, email] = await Promise.all([
        admin.from("nerve_user_profiles").select("full_name").eq("id", target_user_id).maybeSingle(),
        fetchEmail(target_user_id),
      ]);

      let mail = null;
      if (email) {
        mail = await sendActivationEmail({
          email,
          firstName: (profile?.full_name ?? "").split(" ")[0] ?? "",
          module,
          appOrigin: origin,
        });
      }

      return new Response(JSON.stringify({ ok: true, email: mail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "suspend_module") {
      const { target_user_id, module } = body;
      await admin
        .from("nerve_module_access")
        .update({ status: "suspended" })
        .eq("user_id", target_user_id)
        .eq("module", module);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown_action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nerve-admin error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
