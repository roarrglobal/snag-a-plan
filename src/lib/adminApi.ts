import { supabase } from "@/integrations/supabase/client";

export interface AdminData {
  profiles: AdminProfile[];
  access: AdminAccess[];
  intakes: AdminIntake[];
  emails: Record<string, string>;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  company_name: string;
  job_title: string | null;
  team_size: string | null;
  primary_module: string | null;
  onboarding_status: "pending_review" | "intake_scheduled" | "intake_complete" | "active" | "suspended";
  is_admin: boolean;
  notes: string | null;
  calendly_url: string | null;
  unread_admin_notifications: number;
  created_at: string;
  updated_at: string;
}

export interface AdminAccess {
  id: string;
  user_id: string;
  module: "pulse" | "scan" | "zero" | "snag";
  status: "requested" | "pending_intake" | "active" | "suspended" | "trial";
  requested_at: string;
  activated_at: string | null;
  activated_by: string | null;
  trial_expires_at: string | null;
  notes: string | null;
}

export interface AdminIntake {
  id: string;
  user_id: string;
  modules_requested: string[];
  current_situation: string;
  company_arr: string | null;
  team_context: string | null;
  how_found: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

async function call<T = any>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("nerve-admin", { body });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export const adminApi = {
  fetch: () => call<AdminData>({ action: "fetch" }),
  resetUnread: () => call({ action: "reset_unread" }),
  updateProfile: (target_user_id: string, patch: Partial<AdminProfile>) =>
    call({ action: "update_profile", target_user_id, patch }),
  scheduleIntake: (target_user_id: string, calendly_url: string) =>
    call({ action: "schedule_intake", target_user_id, calendly_url }),
  markIntakeComplete: (target_user_id: string) =>
    call({ action: "mark_intake_complete", target_user_id }),
  markIntakeReviewed: (intake_id: string) => call({ action: "mark_intake_reviewed", intake_id }),
  activateModule: (target_user_id: string, module: string, trial_until?: string | null) =>
    call({ action: "activate_module", target_user_id, module, trial_until: trial_until ?? null }),
  suspendModule: (target_user_id: string, module: string) =>
    call({ action: "suspend_module", target_user_id, module }),
};
