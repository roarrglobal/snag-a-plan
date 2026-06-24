import { callZeroAI, corsHeaders, jsonResponse } from "../_shared/zero-ai.ts";

const SYSTEM = `You are applying Stage 2 of the ZERO framework.

Classify this belief as:
STRUCTURALLY-TRUE (has articulable mechanism independent of precedent),
PRECEDENT-TRUE (supported by past success, mechanism not articulated),
or ANALOGY-TRUE (held because comparable organisation holds it).

Provide:
1. Recommended classification
2. One sentence explaining the reasoning
3. The defence statement the practitioner should be able to articulate if this belief is correct

Return JSON:
{"classification":"structurally_true|precedent_true|analogy_true","reasoning":"...","defence_statement":"..."}

Return JSON only. No preamble. No markdown.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { decision, belief, named_source, date_established } = await req.json();
    if (!belief) return jsonResponse({ error: "Belief required" }, 400);
    const user = `Decision: ${decision}\nBelief: ${belief}\nNamed source: ${named_source || "(none)"}\nDate established: ${date_established || "(none)"}`;
    const result = await callZeroAI(SYSTEM, user);
    return jsonResponse(result);
  } catch (e) {
    console.error("[zero-stage2-classify]", e);
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
