import { callZeroAI, corsHeaders, jsonResponse } from "../_shared/zero-ai.ts";

const SYSTEM = `You are an adversarial analyst applying the ZERO first-principles framework. The user is examining a business decision.

Generate 6-10 candidate load-bearing beliefs that this decision likely depends on.

For each belief:
- State the belief as a clear declarative sentence
- Suggest a probable named source (type of source: founder judgment, industry research, past experience, consultant recommendation, board directive, market data)
- Suggest a probable date range of establishment
- Flag current validity: LIKELY CURRENT / REQUIRES EXAMINATION / LIKELY OUTDATED

Return JSON object with a "beliefs" array:
{"beliefs":[{"belief":"...","suggested_source":"...","suggested_date":"...","validity_flag":"..."}]}

Return JSON only. No preamble. No markdown.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { decision, context } = await req.json();
    if (!decision || decision.length < 10) {
      return jsonResponse({ error: "Decision text required" }, 400);
    }
    const result = await callZeroAI(SYSTEM, `Decision: ${decision}\nContext: ${context || "(none provided)"}`);
    const beliefs = Array.isArray(result) ? result : result.beliefs || [];
    return jsonResponse({ beliefs });
  } catch (e) {
    console.error("[zero-stage1-generate]", e);
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
