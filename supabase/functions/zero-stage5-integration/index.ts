import { callZeroAI, corsHeaders, jsonResponse } from "../_shared/zero-ai.ts";

const SYSTEM = `You are applying Stage 5 of the ZERO framework.

Draft an Integration Protocol for this decision.

Requirements:
1. Exactly three measurement points: what to measure, how frequently, what metric
2. Exactly three tolerance bands: specific numerical ranges that indicate the decision is working within expectations
3. Exactly three escalation triggers: specific conditions that require re-entering the ZERO framework at a specific stage (use stage names: "Stage 1 — Identification", "Stage 2 — Inference", "Stage 3 — Inversion", "Stage 4 — Ideation")
4. One external accountability requirement: who will review performance against the bands

Return JSON:
{"measurement_points":[{"metric":"...","frequency":"...","target":"..."}],"tolerance_bands":[{"metric":"...","acceptable_range":"...","breach_condition":"..."}],"escalation_triggers":[{"condition":"...","re_entry_stage":"...","action":"..."}],"accountability":"..."}

Return JSON only. No preamble. No markdown.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { decision, conclusion, elements } = await req.json();
    const user = `Decision: ${decision}\nConclusion summary: ${conclusion || "(none)"}\nGrounded elements:\n${(elements || []).map((e: any, i: number) => `${i + 1}. ${e.element}`).join("\n") || "(none)"}`;
    const result = await callZeroAI(SYSTEM, user);
    return jsonResponse(result);
  } catch (e) {
    console.error("[zero-stage5-integration]", e);
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
