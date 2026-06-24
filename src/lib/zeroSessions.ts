import { supabase } from "@/integrations/supabase/client";

export type Verdict = "survive" | "survive_modified" | "fail" | "indeterminate";
export type Classification = "structurally_true" | "precedent_true" | "analogy_true";
export type ValidityFlag = "likely_current" | "requires_examination" | "likely_outdated";
export type OverallVerdict = "proceed" | "proceed_modified" | "do_not_proceed" | "insufficient_evidence";

export interface Belief {
  id: string;
  belief: string;
  load_bearing: boolean;
  named_source: string;
  date_established: string;
  validity_flag: ValidityFlag;
}

export interface InferenceItem {
  belief_id: string;
  classification: Classification | null;
  reasoning: string;
  defence_statement: string;
}

export interface InversionItem {
  belief_id: string;
  counter_position: string;
  mechanism: string;
  required_conditions: string;
  challenge_question: string;
  response: string;
  verdict: Verdict | null;
  modification_note: string;
}

export interface MatrixElement {
  element: string;
  supporting_irreducibles: string[];
  status: "grounded" | "smuggled";
  smuggling_note: string | null;
}

export interface Stage4Matrix {
  conclusion_summary: string;
  elements: MatrixElement[];
}

export interface Stage5Protocol {
  measurement_points: { metric: string; frequency: string; target: string }[];
  tolerance_bands: { metric: string; acceptable_range: string; breach_condition: string }[];
  escalation_triggers: { condition: string; re_entry_stage: string; action: string }[];
  accountability: string;
  signed_off: boolean;
}

export interface ZeroSessionRow {
  id: string;
  user_id: string | null;
  scan_session_id: string | null;
  decision_text: string | null;
  context_text: string | null;
  stage1_register: Belief[] | null;
  stage2_inference: InferenceItem[] | null;
  stage3_inversion: InversionItem[] | null;
  stage4_matrix: Stage4Matrix | null;
  stage5_protocol: Stage5Protocol | null;
  overall_verdict: OverallVerdict | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export const STORAGE_KEY = "nerve_zero_session_id";

export async function createSession(decision_text: string, context_text: string, scan_session_id?: string | null): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("zero_sessions")
    .insert({
      user_id: user.id,
      decision_text,
      context_text: context_text || null,
      scan_session_id: scan_session_id ?? null,
      status: "in_progress",
      // legacy NOT-NULL columns no longer required after migration
    } as any)
    .select("id")
    .single();
  if (error) {
    console.error("[createSession]", error);
    return null;
  }
  sessionStorage.setItem(STORAGE_KEY, data.id);
  return data.id;
}

export async function updateSession(id: string, patch: Partial<ZeroSessionRow>): Promise<void> {
  const { error } = await supabase.from("zero_sessions").update(patch as any).eq("id", id);
  if (error) console.error("[updateSession]", error);
}

export async function listSessions(): Promise<ZeroSessionRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("zero_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listSessions]", error);
    return [];
  }
  return (data || []) as unknown as ZeroSessionRow[];
}

export async function getSession(id: string): Promise<ZeroSessionRow | null> {
  const { data, error } = await supabase.from("zero_sessions").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[getSession]", error);
    return null;
  }
  return (data as unknown as ZeroSessionRow) ?? null;
}

export async function deleteSession(id: string): Promise<void> {
  await supabase.from("zero_sessions").delete().eq("id", id);
}

export function firstIncompleteStage(s: ZeroSessionRow): number {
  if (!s.decision_text) return 0;
  if (!s.stage1_register || s.stage1_register.length === 0) return 1;
  if (!s.stage2_inference || s.stage2_inference.length === 0) return 2;
  if (!s.stage3_inversion || s.stage3_inversion.length === 0) return 3;
  if (!s.stage4_matrix) return 4;
  if (!s.stage5_protocol?.signed_off) return 5;
  return 6;
}

export function computeOverallVerdict(inversion: InversionItem[]): OverallVerdict {
  if (!inversion.length) return "insufficient_evidence";
  const verdicts = inversion.map((i) => i.verdict);
  const failed = verdicts.filter((v) => v === "fail").length;
  const indeterminate = verdicts.filter((v) => v === "indeterminate").length;
  const modified = verdicts.filter((v) => v === "survive_modified").length;
  if (failed > 0) return "do_not_proceed";
  if (indeterminate >= 2) return "insufficient_evidence";
  if (modified > 0) return "proceed_modified";
  return "proceed";
}

export function verdictLabel(v: OverallVerdict | null): string {
  switch (v) {
    case "proceed": return "PROCEED";
    case "proceed_modified": return "PROCEED MODIFIED";
    case "do_not_proceed": return "DO NOT PROCEED";
    case "insufficient_evidence": return "INSUFFICIENT EVIDENCE";
    default: return "IN PROGRESS";
  }
}

export function verdictColor(v: OverallVerdict | null): { bg: string; fg: string } {
  switch (v) {
    case "proceed": return { bg: "#DCFCE7", fg: "#166534" };
    case "proceed_modified": return { bg: "#FEF3C7", fg: "#92400E" };
    case "do_not_proceed": return { bg: "#FEE2E2", fg: "#991B1B" };
    case "insufficient_evidence": return { bg: "#E0E7FF", fg: "#3730A3" };
    default: return { bg: "#F3F4F6", fg: "#6B7280" };
  }
}
