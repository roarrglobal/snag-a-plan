import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "update_snag_gate_status",
  title: "Update SNAG gate status",
  description:
    "Update the status of one of the signed-in user's SNAG gates to active, fired, cleared or expired.",
  inputSchema: {
    gate_id: z.string().describe("The gate (analysis) id."),
    status: z.enum(["active", "fired", "cleared", "expired"]).describe("New gate status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ gate_id, status }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("analyses")
      .update({ gate_status: status })
      .eq("id", gate_id)
      .eq("user_id", ctx.getUserId())
      .select("id, title, gate_status")
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Gate not found or not owned by this user.");
    return jsonResult({ gate: data });
  },
});
