import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_snag_gates",
  title: "List SNAG gates",
  description:
    "List the signed-in user's SNAG decision gates, optionally filtered by status (active, fired, cleared, expired).",
  inputSchema: {
    status: z
      .enum(["active", "fired", "cleared", "expired"])
      .optional()
      .describe("Filter by gate status."),
    limit: z.number().int().optional().describe("Max rows to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("analyses")
      .select("id, title, original_input, gate_status, owner_name, signal_due_date, source_module, category, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(take);
    if (status) query = query.eq("gate_status", status);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, gates: data ?? [] });
  },
});
