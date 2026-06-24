import { supabase } from "@/integrations/supabase/client";
import { PILLARS } from "@/scan/pillars";
import { pillarTotal, statusFor, type Scores, type BindingConstraint, type CompanyInputs } from "@/scan/calc";

interface SaveScanSessionArgs {
  companyInputs: CompanyInputs;
  scores: Scores;
  binding: BindingConstraint;
  impact: {
    winImprovement: number;
    forecastImprovement: number;
    pipelineQuality: number;
    nrrImprovement: number;
    total: number;
  };
}

export interface SavedScanSession {
  id: string;
  email: string | null;
}

export async function saveScanSession({
  companyInputs,
  scores,
  binding,
  impact,
}: SaveScanSessionArgs): Promise<SavedScanSession | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const guestEmail = !user ? (localStorage.getItem("nerve_scan_email") || null) : null;

    const pillar_scores = PILLARS.map((p) => {
      const vals = scores[p.id] ?? [];
      const total = pillarTotal(vals);
      return {
        pillar_number: p.id,
        pillar_name: p.name,
        tier: p.tier,
        scores: vals.map((v) => v ?? 0),
        total,
        notes: [],
      };
    });

    const binding_constraint = {
      pillar_number: binding.pillarId,
      pillar_name: binding.pillarName,
      tier: binding.tier,
      score: binding.total,
      weighted_score: binding.constraintScore,
      evidence: binding.evidence,
    };

    const financial_impact = {
      win_rate_impact: impact.winImprovement,
      forecast_impact: impact.forecastImprovement,
      pipeline_impact: impact.pipelineQuality,
      nrr_impact: impact.nrrImprovement,
      total_impact: impact.total,
    };

    const { data, error } = await supabase
      .from("scan_sessions")
      .insert({
        user_id: user?.id ?? null,
        guest_email: guestEmail,
        company_inputs: companyInputs as any,
        pillar_scores: pillar_scores as any,
        binding_constraint: binding_constraint as any,
        financial_impact: financial_impact as any,
        completed: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[saveScanSession] insert failed", error);
      return null;
    }

    sessionStorage.setItem("nerve_scan_session_id", data.id);
    localStorage.setItem("nerve_scan_last_session_id", data.id);

    const email = user?.email ?? guestEmail ?? null;

    // Fire-and-forget notification
    supabase.functions
      .invoke("scan-notification", {
        body: {
          scan_session_id: data.id,
          binding_constraint_name: binding.pillarName,
          binding_constraint_score: binding.total,
          total_financial_impact: impact.total,
          arr: companyInputs.arr,
          email: email ?? "(unknown)",
        },
      })
      .catch((e) => console.warn("[saveScanSession] notification failed", e));

    return { id: data.id, email };
  } catch (e) {
    console.error("[saveScanSession] unexpected error", e);
    return null;
  }
}
