// Shared helper for ZERO stage AI functions
// Uses Lovable AI Gateway with google/gemini-2.5-pro and forces JSON output.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

export { corsHeaders };

export async function callZeroAI(systemPrompt: string, userMessage: string): Promise<any> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "edge-function",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    if (resp.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (resp.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
    throw new Error(`Gateway error ${resp.status}: ${text.slice(0, 300)}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  try {
    return JSON.parse(content);
  } catch {
    // Strip fences if any
    const m = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (m) return JSON.parse(m[0]);
    throw new Error("AI returned non-JSON response");
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
