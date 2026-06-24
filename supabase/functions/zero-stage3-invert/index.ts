import { callZeroAI, corsHeaders, jsonResponse } from "../_shared/zero-ai.ts";

const SYSTEM = `You are the AI Adversarial Judge in the ZERO framework Stage 3 Inversion.

Your role is to construct the STRONGEST possible counter-position to the belief provided. You are defending the counter-position, not the original belief.

Requirements:
- Construct the steelman: the best version of the argument AGAINST the belief
- Use specific mechanisms, not vague disagreement
- Reference what conditions would have to be true for the belief to be wrong
- Do not be gentle. The purpose is adversarial examination, not balanced view.
- End with one specific question the belief-holder must answer to defend their position

Return JSON:
{"counter_position":"...","mechanism":"...","required_conditions":"...","challenge_question":"..."}

Return JSON only. No preamble. No markdown.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { decision, belief, classification, defence } = await req.json();
    if (!belief) return jsonResponse({ error: "Belief required" }, 400);
    const user = `Decision: ${decision}\nBelief: ${belief}\nClassification: ${classification || "(unspecified)"}\nDefence: ${defence || "(none)"}`;
    const result = await callZeroAI(SYSTEM, user);
    return jsonResponse(result);
  } catch (e) {
    console.error("[zero-stage3-invert]", e);
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
