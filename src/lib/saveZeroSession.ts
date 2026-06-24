import { supabase } from "@/integrations/supabase/client";

export interface SaveZeroArgs {
  pillarNumber: number;
  pillarName: string;
  beliefStatement: string;
  originSelection: string | null;
  classification: string | null;
  counterPositionResponse: string | null;
  verdict: string;
  modificationNote: string | null;
  scanSessionId?: string | null;
}

export async function saveZeroSession(args: SaveZeroArgs): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const guestEmail = !user ? (localStorage.getItem("nerve_scan_email") || null) : null;

    const { data, error } = await supabase
      .from("zero_sessions")
      .insert({
        user_id: user?.id ?? null,
        guest_email: guestEmail,
        scan_session_id: args.scanSessionId ?? null,
        pillar_number: args.pillarNumber,
        pillar_name: args.pillarName,
        belief_statement: args.beliefStatement,
        origin_selection: args.originSelection,
        classification: args.classification,
        counter_position_response: args.counterPositionResponse,
        verdict: args.verdict,
        modification_note: args.modificationNote,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[saveZeroSession] insert failed", error);
      return null;
    }

    sessionStorage.setItem("nerve_zero_session_id", data.id);

    // Link to scan_sessions if applicable
    if (args.scanSessionId) {
      await supabase
        .from("scan_sessions")
        .update({ zero_session_id: data.id })
        .eq("id", args.scanSessionId);
    }

    return data.id;
  } catch (e) {
    console.error("[saveZeroSession] unexpected", e);
    return null;
  }
}
