import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_scan_sessions",
  title: "List Scan sessions",
  description:
    "List the signed-in user's Scan diagnostic sessions, including pillar scores and the binding constraint.",
  inputSchema: {
    status: z.enum(["in_progress", "completed"]).optional().describe("Filter by session status."),
    limit: z.number().int().optional().describe("Max rows to return (default 10, max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 10, 1), 50);
    let query = supabaseForUser(ctx)
      .from("scan_sessions")
      .select("id, status, completed, company_inputs, pillar_scores, binding_constraint, financial_impact, zero_session_id, created_at, updated_at")
      .eq("user_id", ctx.getUserId())
      .order("updated_at", { ascending: false })
      .limit(take);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, sessions: data ?? [] });
  },
});
