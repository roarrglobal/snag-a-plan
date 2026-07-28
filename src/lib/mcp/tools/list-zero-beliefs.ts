import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_zero_beliefs",
  title: "List ZERO belief examinations",
  description:
    "List the signed-in user's ZERO belief examination sessions with their classification and verdict.",
  inputSchema: {
    scan_session_id: z.string().optional().describe("Only beliefs linked to this Scan session."),
    limit: z.number().int().optional().describe("Max rows to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ scan_session_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("zero_sessions")
      .select("id, pillar_number, pillar_name, belief_statement, origin_selection, classification, verdict, modification_note, scan_session_id, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(take);
    if (scan_session_id) query = query.eq("scan_session_id", scan_session_id);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, beliefs: data ?? [] });
  },
});
