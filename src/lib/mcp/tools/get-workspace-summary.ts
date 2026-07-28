import { defineTool } from "@lovable.dev/mcp-js";
import { jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_workspace_summary",
  title: "Get workspace summary",
  description:
    "Summarise the signed-in user's Nerve workspace: profile, module access, and counts of Scan sessions, ZERO beliefs and SNAG gates.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [profile, access, gates, scans, beliefs] = await Promise.all([
      supabase
        .from("nerve_user_profiles")
        .select("full_name, company_name, job_title, primary_module, onboarding_status")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("nerve_module_access").select("module, status, trial_expires_at").eq("user_id", userId),
      supabase.from("analyses").select("gate_status", { count: "exact" }).eq("user_id", userId),
      supabase.from("scan_sessions").select("status", { count: "exact" }).eq("user_id", userId),
      supabase.from("zero_sessions").select("verdict", { count: "exact" }).eq("user_id", userId),
    ]);

    return jsonResult({
      email: ctx.getUserEmail(),
      profile: profile.data ?? null,
      module_access: access.data ?? [],
      counts: {
        snag_gates: gates.count ?? 0,
        active_gates: (gates.data ?? []).filter((g: any) => g.gate_status === "active").length,
        scan_sessions: scans.count ?? 0,
        zero_beliefs: beliefs.count ?? 0,
      },
    });
  },
});
