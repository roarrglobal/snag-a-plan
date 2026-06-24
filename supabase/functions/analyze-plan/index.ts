import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  validateString, 
  sanitizeForPrompt, 
  validationErrorResponse,
  MAX_TEXT_SIZE,
  MIN_PLAN_LENGTH 
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a pre-mortem analyst. Stress-test the user's plan and return analysis in this EXACT JSON structure.

CRITICAL: Use these EXACT field names. Do not deviate.

{
  "blind_spots": [
    {
      "blind_spot": "The specific assumption or gap",
      "why_it_matters": "Why this matters for the plan",
      "how_to_test": "How to validate this"
    },
    {
      "blind_spot": "Second blind spot",
      "why_it_matters": "Why this matters",
      "how_to_test": "How to test"
    },
    {
      "blind_spot": "Third blind spot",
      "why_it_matters": "Why this matters",
      "how_to_test": "How to test"
    }
  ],
  
  "failure_modes": [
    {
      "what_fails": "Specific failure description",
      "mechanism": "How and why this happens",
      "likelihood": "High",
      "impact": "What damage occurs",
      "mitigation": "How to prevent or reduce risk"
    },
    {
      "what_fails": "Second failure",
      "mechanism": "How it happens",
      "likelihood": "Medium",
      "impact": "The damage",
      "mitigation": "Prevention"
    },
    {
      "what_fails": "Third failure",
      "mechanism": "How it happens",
      "likelihood": "Low",
      "impact": "The damage",
      "mitigation": "Prevention"
    }
  ],
  
  "warning_signals": [
    {
      "signal": "Observable indicator",
      "timeframe": "When to watch for it"
    },
    {
      "signal": "Second signal",
      "timeframe": "Timeframe"
    },
    {
      "signal": "Third signal",
      "timeframe": "Timeframe"
    }
  ],
  
  "kill_criteria": [
    {
      "condition": "If X doesn't happen by Y",
      "action": "Then do Z",
      "threshold": "Specific measurable threshold"
    },
    {
      "condition": "Second condition",
      "action": "Action to take",
      "threshold": "Threshold"
    }
  ],
  
  "unasked_question": "The one uncomfortable question they should be asking",
  
  "bottom_line": {
    "verdict": "proceed_confidently|proceed_carefully|investigate_first|reconsider_seriously",
    "reasoning": "One sentence explaining the verdict",
    "change_condition": "The one thing that would change this assessment",
    "next_step": "Your next concrete step (actionable recommendation)"
  },
  
  "category": "career|business|personal|travel|other"
}

RULES:
1. Return ONLY valid JSON. No markdown, no backticks, no explanation.
2. Use EXACTLY these field names — blind_spot, why_it_matters, how_to_test, what_fails, mechanism, likelihood, impact, mitigation, signal, timeframe, condition, action, threshold.
3. likelihood must be exactly "High", "Medium", or "Low" (capitalized).
4. category must be exactly one of: career, business, personal, travel, other (lowercase).
5. verdict must be exactly one of: proceed_confidently, proceed_carefully, investigate_first, reconsider_seriously.
6. Always provide exactly 3 blind spots, 3 failure modes, 3-5 warning signals, 2-3 kill criteria.
7. Be specific to the user's actual plan. Reference their specific details.
8. No generic advice. No clichés.
9. The bottom_line verdict should be based on your overall assessment of the risks.

B2B REVENUE TEAM CONTEXT:
This is a B2B revenue team decision gate. The user is a CRO, VP Sales, CEO, or RevOps leader at a B2B company. They are about to commit resources to a revenue motion — a pricing change, market entry, restructure, new sales play, or similar commercial commitment.

Structure all outputs for a team context, not an individual context:
- Use "your team" not "you"
- Surface assumptions the team is collectively holding
- Name failure modes in terms of commercial and pipeline impact
- Alert signals (warning_signals) must be observable in CRM or pipeline data within 30 days
- Kill criteria must be specific, measurable, and written before commitment
- The unasked question should be the one the team's confirmation bias is preventing them from asking

Do not output generic risk management advice. Output specific, diagnostic, revenue-context analysis that a CRO would find operationally useful.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for authentication - but allow unauthenticated requests for free trial
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    // If auth header provided, validate the token
    if (authHeader?.startsWith('Bearer ')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      // Validate the JWT and get user - MUST pass token explicitly when verify_jwt=false
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && user) {
        userId = user.id;
        console.log("Authenticated user:", userId);
      } else {
        console.log("Token validation failed (allowing as anonymous):", userError?.message);
      }
    } else {
      console.log("No authorization header - processing as free trial");
    }
    
    // Log whether this is authenticated or anonymous
    if (userId) {
      console.log("Processing authenticated request for user:", userId);
    } else {
      console.log("Processing anonymous/free trial request");
    }

    // Handle empty body gracefully
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === '') {
        console.log("Empty request body received");
        return new Response(
          JSON.stringify({ error: "Request body is empty" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      body = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse request body:", parseErr);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // SECURITY: Validate and sanitize the plan input
    const planValidation = validateString(body?.plan, {
      minLength: MIN_PLAN_LENGTH,
      maxLength: MAX_TEXT_SIZE,
      fieldName: 'Plan'
    });
    
    if (!planValidation.valid) {
      console.log("Validation failed:", planValidation.error);
      return validationErrorResponse(planValidation.error, corsHeaders);
    }
    
    const plan = planValidation.value;
    const cosmicData = body?.cosmic_data || null;
    console.log("Plan validated, length:", plan.length, "cosmic_data:", !!cosmicData);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling Lovable AI Gateway for plan analysis...");

    // Build cosmic timing supplement for the prompt
    let cosmicSupplement = "";
    if (cosmicData) {
      cosmicSupplement = `\n\nADDITIONAL CONTEXT - COSMIC TIMING DATA (User has purchased mystical readings):
The user wants cosmic timing insights integrated into the analysis. Based on their birth data and readings, add a "cosmic_timing" field to the JSON output with this structure:
{
  "cosmic_timing": {
    "planetary_transits": [{ "transit": "string", "relevance": "how it relates to this decision", "influence": "favorable|neutral|unfavorable" }],
    "numerology_timing": { "personal_year": number, "personal_month": number, "interpretation": "string" },
    "favorable_periods": [{ "period": "string", "reason": "string" }],
    "unfavorable_periods": [{ "period": "string", "reason": "string" }],
    "timing_recommendation": "Overall recommendation for decision timing based on cosmic factors"
  }
}

User's reading data: ${JSON.stringify(cosmicData).substring(0, 3000)}

Make the cosmic timing section specific to this decision. Reference the actual transits, dasha periods, or numerology data from their readings. This section is SUPPLEMENTARY to the main analysis.`;
    }

    const enhancedSystemPrompt = cosmicData 
      ? systemPrompt + cosmicSupplement 
      : systemPrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          { role: "user", content: `Analyze this plan and identify potential problems:\n\n${sanitizeForPrompt(plan)}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze plan. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Invalid response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      
      // Log raw AI response for debugging
      console.log("Raw AI Response (first 500 chars):", cleanedContent.substring(0, 500));
      
      analysisResult = JSON.parse(cleanedContent);
      
      // Log parsed structure for debugging
      console.log("Parsed analysis structure keys:", Object.keys(analysisResult));
    } catch (parseError) {
      console.error("Failed to parse AI response:", content, parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the essential structure
    if (
      !analysisResult.blind_spots ||
      !analysisResult.failure_modes ||
      !analysisResult.warning_signals ||
      !analysisResult.kill_criteria ||
      !analysisResult.unasked_question
    ) {
      console.error("Invalid analysis structure. Keys found:", Object.keys(analysisResult));
      console.error("Full invalid response:", JSON.stringify(analysisResult, null, 2));
      return new Response(
        JSON.stringify({ error: "Incomplete analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the category from AI response, or auto-detect
    let category = analysisResult.category || "other";
    
    // Validate category is one of the allowed values
    const validCategories = ["career", "business", "personal", "travel", "other"];
    if (!validCategories.includes(category.toLowerCase())) {
      category = "other";
    } else {
      category = category.toLowerCase();
    }
    
    // Ensure category is set on the result
    analysisResult.category = category;

    console.log("Analysis completed successfully with category:", category);
    console.log("Blind spots count:", analysisResult.blind_spots?.length);
    console.log("Failure modes count:", analysisResult.failure_modes?.length);
    console.log("First blind spot fields:", analysisResult.blind_spots?.[0] ? Object.keys(analysisResult.blind_spots[0]) : "none");
    console.log("First failure mode fields:", analysisResult.failure_modes?.[0] ? Object.keys(analysisResult.failure_modes[0]) : "none");

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyze plan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
