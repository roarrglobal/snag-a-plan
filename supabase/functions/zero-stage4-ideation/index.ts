import { callZeroAI, corsHeaders, jsonResponse } from "../_shared/zero-ai.ts";

const SYSTEM = `You are applying Stage 4 of the ZERO framework.

Build a decision conclusion forward from the surviving irreducibles ONLY. Surviving irreducibles are beliefs that survived Stage 3. Failed beliefs must not appear in the conclusion.

Requirements:
1. Propose a conclusion with 4-6 elements
2. For each element: map to at least one surviving irreducible (quote the irreducible succinctly)
3. Flag any element that appears to be smuggling a failed belief
4. Mark each element as "grounded" (traces to surviving irreducible) or "smuggled" (traces to failed belief)

Return JSON:
{"conclusion_summary":"...","elements":[{"element":"...","supporting_irreducibles":["..."],"status":"grounded|smuggled","smuggling_note":"... or null"}]}

Return JSON only. No preamble. No markdown.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { decision, surviving, failed } = await req.json();
    const user = `Decision: ${decision}\nSurviving irreducibles:\n${(surviving || []).map((s: any, i: number) => `${i + 1}. ${s.belief} (verdict: ${s.verdict}${s.modification ? `, modification: ${s.modification}` : ""})`).join("\n") || "(none)"}\n\nFailed beliefs:\n${(failed || []).map((f: string, i: number) => `${i + 1}. ${f}`).join("\n") || "(none)"}`;
    const result = await callZeroAI(SYSTEM, user);
    return jsonResponse(result);
  } catch (e) {
    console.error("[zero-stage4-ideation]", e);
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
