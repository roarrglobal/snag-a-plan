import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as djwt from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function createQuickOutcomeToken(userId: string, decisionId: string, teamId: string): Promise<string> {
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

  const payload = {
    user_id: userId,
    decision_id: decisionId,
    team_id: teamId,
    exp: djwt.getNumericDate(72 * 60 * 60), // 72 hours
  };

  return await djwt.create({ alg: "HS256", typ: "JWT" }, payload, key);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const body = await req.json().catch(() => ({}));
    const isOverdue = body.overdue === true;

    let query;
    if (isOverdue) {
      // Find overdue decisions (3+ days past check date, no outcome logged)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      query = adminClient
        .from("team_decisions")
        .select("id, decision_text, team_id, created_by, created_at, outcome_check_date")
        .lte("outcome_check_date", threeDaysAgo.toISOString().split("T")[0])
        .eq("status", "decided");
    } else {
      // Find decisions due today
      query = adminClient
        .from("team_decisions")
        .select("id, decision_text, team_id, created_by, created_at, outcome_check_date")
        .eq("outcome_check_date", today)
        .eq("status", "decided");
    }

    const { data: decisions, error } = await query;

    if (error) {
      console.error("Failed to fetch decisions:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!decisions || decisions.length === 0) {
      return new Response(JSON.stringify({ queued: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out those with existing outcomes
    const decisionIds = decisions.map(d => d.id);
    const { data: existingOutcomes } = await adminClient
      .from("team_outcomes")
      .select("decision_id")
      .in("decision_id", decisionIds);
    
    const completedIds = new Set((existingOutcomes || []).map(o => o.decision_id));
    const pendingDecisions = decisions.filter(d => !completedIds.has(d.id));

    if (pendingDecisions.length === 0) {
      return new Response(JSON.stringify({ queued: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For overdue: check we haven't sent in last 7 days
    let filteredDecisions = pendingDecisions;
    if (isOverdue) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentEmails } = await adminClient
        .from("email_queue")
        .select("template_data")
        .eq("email_type", "outcome_overdue")
        .gte("created_at", sevenDaysAgo.toISOString());
      
      const recentDecisionIds = new Set(
        (recentEmails || []).map(e => (e.template_data as any)?.decision_id).filter(Boolean)
      );
      filteredDecisions = pendingDecisions.filter(d => !recentDecisionIds.has(d.id));
    }

    let queued = 0;
    const emailType = isOverdue ? "outcome_overdue" : "outcome_reminder";

    for (const decision of filteredDecisions) {
      // Get user email
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const user = authUsers?.users?.find(u => u.id === decision.created_by);
      if (!user?.email) continue;

      // Get team info
      const { data: team } = await adminClient
        .from("teams")
        .select("name, slug")
        .eq("id", decision.team_id)
        .maybeSingle();

      const appUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "https://snagme.app";
      
      // Create quick outcome token
      let quickOutcomeUrl = "";
      try {
        const token = await createQuickOutcomeToken(decision.created_by, decision.id, decision.team_id);
        quickOutcomeUrl = `${supabaseUrl}/functions/v1/quick-outcome?token=${token}`;
      } catch (e) {
        console.error("Failed to create quick outcome token:", e);
      }

      const daysAgo = Math.floor((Date.now() - new Date(decision.created_at).getTime()) / (1000 * 60 * 60 * 24));

      const templateData = {
        decision_id: decision.id,
        decision_title: decision.decision_text,
        decision_date: new Date(decision.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        days_ago: daysAgo,
        due_date: decision.outcome_check_date,
        outcome_url: `https://snagme.app/team/${team?.slug}/decisions/${decision.id}/outcome`,
        quick_outcome_url: quickOutcomeUrl,
        app_url: "https://snagme.app",
      };

      // Queue the email
      await adminClient.from("email_queue").insert({
        user_id: decision.created_by,
        team_id: decision.team_id,
        email_type: emailType,
        subject: isOverdue 
          ? `Outcome overdue: "${decision.decision_text.slice(0, 50)}"` 
          : `Time to check in: "${decision.decision_text.slice(0, 50)}"`,
        to_email: user.email,
        template_data: templateData,
        scheduled_for: new Date().toISOString(),
      });
      queued++;
    }

    console.log(`Queued ${queued} ${emailType} emails`);

    return new Response(
      JSON.stringify({ queued, type: emailType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Schedule reminders error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
