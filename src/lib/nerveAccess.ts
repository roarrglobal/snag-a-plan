import { supabase } from "@/integrations/supabase/client";

export type NerveModule = "pulse" | "scan" | "zero" | "snag";

export const MODULE_META: Record<
  NerveModule,
  { label: string; color: string; light: string; dark: string; description: string }
> = {
  pulse: {
    label: "Pulse",
    color: "#16A34A",
    light: "#F0FDF4",
    dark: "#14532D",
    description: "Continuous pipeline monitoring. CRM hygiene, deal health, and execution decay alerts.",
  },
  scan: {
    label: "Scan",
    color: "#0047AB",
    light: "#EFF6FF",
    dark: "#1E3A5F",
    description: "Eight-pillar revenue diagnostic. Identifies the binding constraint costing you the most.",
  },
  zero: {
    label: "ZERO",
    color: "#D97706",
    light: "#FFFBEB",
    dark: "#78350F",
    description: "First-principles belief examination. Surface what your team is assuming and whether it holds.",
  },
  snag: {
    label: "SNAG",
    color: "#BE3455",
    light: "#FFF1F2",
    dark: "#7F1D1D",
    description: "Pre-commitment decision gate. Surface the assumption. Set the kill criterion.",
  },
};

export interface NerveUserProfile {
  id: string;
  full_name: string;
  company_name: string;
  job_title: string | null;
  team_size: string | null;
  primary_module: NerveModule | null;
  onboarding_status: "pending_review" | "intake_scheduled" | "intake_complete" | "active" | "suspended";
  is_admin: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NerveModuleAccess {
  id: string;
  user_id: string;
  module: NerveModule;
  status: "requested" | "pending_intake" | "active" | "suspended" | "trial";
  requested_at: string;
  activated_at: string | null;
  trial_expires_at: string | null;
  notes: string | null;
}

const sb = supabase as any;

export async function fetchNerveProfile(userId: string): Promise<NerveUserProfile | null> {
  const { data, error } = await sb
    .from("nerve_user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.warn("fetchNerveProfile", error);
    return null;
  }
  return (data as NerveUserProfile) ?? null;
}

export async function fetchModuleAccess(userId: string): Promise<NerveModuleAccess[]> {
  const { data, error } = await sb
    .from("nerve_module_access")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    console.warn("fetchModuleAccess", error);
    return [];
  }
  return (data as NerveModuleAccess[]) ?? [];
}

export async function requestModuleAccess(userId: string, module: NerveModule) {
  return sb.from("nerve_module_access").insert({ user_id: userId, module, status: "requested" });
}

export interface IntakePayload {
  user_id: string;
  modules_requested: NerveModule[];
  current_situation: string;
  company_arr: string | null;
  how_found: string | null;
  team_context?: string | null;
}

export async function submitIntakeForm(payload: IntakePayload) {
  const insertRes = await sb.from("nerve_intake_forms").insert(payload);
  if (insertRes.error) return insertRes;

  // Bump module access rows for requested modules to pending_intake
  for (const mod of payload.modules_requested) {
    // Insert if missing (status=requested), then attempt update via admin path is restricted; we ignore failures.
    await sb
      .from("nerve_module_access")
      .insert({ user_id: payload.user_id, module: mod, status: "requested" })
      .then(() => null, () => null);
  }
  // Note: status flip to 'pending_intake' is admin-only by RLS. The notification email triggers
  // admin action. We still record the request.
  return insertRes;
}
