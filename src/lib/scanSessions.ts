import { supabase } from "@/integrations/supabase/client";
import { PILLARS } from "@/scan/pillars";
import { pillarTotal, type Scores, type BindingConstraint, type CompanyInputs } from "@/scan/calc";

export interface ScanSessionRow {
  id: string;
  user_id: string | null;
  status: string;
  completed: boolean;
  company_inputs: any;
  pillar_scores: any;
  binding_constraint: any;
  financial_impact: any;
  created_at: string;
  updated_at: string | null;
  zero_session_id?: string | null;
}

const serializeScores = (scores: Scores) =>
  PILLARS.map((p) => {
    const vals = scores[p.id] ?? [];
    return {
      pillar_number: p.id,
      pillar_name: p.name,
      tier: p.tier,
      scores: vals.map((v) => v ?? null),
      total: pillarTotal(vals),
    };
  });

export const deserializeScores = (pillar_scores: any): Scores => {
  const s: Scores = {};
  PILLARS.forEach((p) => (s[p.id] = [null, null, null, null, null]));
  if (Array.isArray(pillar_scores)) {
    for (const row of pillar_scores) {
      if (row?.pillar_number && Array.isArray(row.scores)) {
        s[row.pillar_number] = row.scores.map((v: any) =>
          v === null || v === undefined ? null : Number(v)
        );
      }
    }
  }
  return s;
};

export async function createInProgressSession(companyInputs: CompanyInputs): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("scan_sessions")
    .insert({
      user_id: user.id,
      company_inputs: companyInputs as any,
      pillar_scores: serializeScores({} as Scores) as any,
      binding_constraint: {} as any,
      financial_impact: {} as any,
      status: "in_progress",
      completed: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createInProgressSession]", error);
    return null;
  }
  sessionStorage.setItem("nerve_scan_session_id", data.id);
  return data.id;
}

export async function autosavePillarScores(sessionId: string, scores: Scores): Promise<void> {
  await supabase
    .from("scan_sessions")
    .update({
      pillar_scores: serializeScores(scores) as any,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
}

export async function finalizeSession(
  sessionId: string,
  binding: BindingConstraint,
  impact: {
    winImprovement: number;
    forecastImprovement: number;
    pipelineQuality: number;
    nrrImprovement: number;
    total: number;
  },
  companyInputs: CompanyInputs
): Promise<void> {
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

  await supabase
    .from("scan_sessions")
    .update({
      binding_constraint: binding_constraint as any,
      financial_impact: financial_impact as any,
      status: "completed",
      completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  const { data: { user } } = await supabase.auth.getUser();
  supabase.functions
    .invoke("scan-notification", {
      body: {
        scan_session_id: sessionId,
        binding_constraint_name: binding.pillarName,
        binding_constraint_score: binding.total,
        total_financial_impact: impact.total,
        arr: companyInputs.arr,
        email: user?.email ?? "(unknown)",
      },
    })
    .catch((e) => console.warn("[finalizeSession] notification failed", e));
}

export async function listSessions(): Promise<ScanSessionRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("scan_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listSessions]", error);
    return [];
  }
  return (data || []) as ScanSessionRow[];
}

export async function getSession(id: string): Promise<ScanSessionRow | null> {
  const { data, error } = await supabase
    .from("scan_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getSession]", error);
    return null;
  }
  return (data as ScanSessionRow) ?? null;
}

export async function getLatestInProgress(): Promise<ScanSessionRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("scan_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ScanSessionRow) ?? null;
}

export async function deleteSession(id: string): Promise<void> {
  await supabase.from("scan_sessions").delete().eq("id", id);
}
