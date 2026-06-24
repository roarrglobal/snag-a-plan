import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InversionItem, updateSession, Verdict, ZeroSessionRow } from "@/lib/zeroSessions";
import { StageHeader, ContinueBar } from "./Stage1Identification";

const VERDICTS: { id: Verdict; label: string; bg: string; border: string; fg: string }[] = [
  { id: "survive", label: "SURVIVE", bg: "#DCFCE7", border: "#86EFAC", fg: "#166534" },
  { id: "survive_modified", label: "SURVIVE MODIFIED", bg: "#FEF3C7", border: "#FCD34D", fg: "#92400E" },
  { id: "fail", label: "FAIL", bg: "#FEE2E2", border: "#FDA4AF", fg: "#991B1B" },
  { id: "indeterminate", label: "INDETERMINATE", bg: "#E0E7FF", border: "#C7D2FE", fg: "#3730A3" },
];

export function Stage3Inversion({ session, onSaved, onContinue }: {
  session: ZeroSessionRow;
  onSaved: (next: ZeroSessionRow) => void;
  onContinue: () => void;
}) {
  const loadBearing = (session.stage1_register || []).filter((b) => b.load_bearing);
  const inference = session.stage2_inference || [];
  const [items, setItems] = useState<InversionItem[]>(() => {
    const existing = session.stage3_inversion || [];
    return loadBearing.map((b) => {
      const found = existing.find((i) => i.belief_id === b.id);
      return found || {
        belief_id: b.id,
        counter_position: "",
        mechanism: "",
        required_conditions: "",
        challenge_question: "",
        response: "",
        verdict: null,
        modification_note: "",
      };
    });
  });
  const [loadingFor, setLoadingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateSession(session.id, { stage3_inversion: items });
  }, [items, session.id]);

  const update = (id: string, patch: Partial<InversionItem>) =>
    setItems((xs) => xs.map((x) => (x.belief_id === id ? { ...x, ...patch } : x)));

  const invert = async (beliefId: string) => {
    const b = loadBearing.find((x) => x.id === beliefId);
    const inf = inference.find((i) => i.belief_id === beliefId);
    if (!b) return;
    setError(null);
    setLoadingFor(beliefId);
    const { data, error: err } = await supabase.functions.invoke("zero-stage3-invert", {
      body: {
        decision: session.decision_text,
        belief: b.belief,
        classification: inf?.classification || "",
        defence: inf?.defence_statement || "",
      },
    });
    setLoadingFor(null);
    if (err || !data?.counter_position) {
      setError(data?.error || err?.message || "Counter-position failed");
      return;
    }
    update(beliefId, {
      counter_position: data.counter_position,
      mechanism: data.mechanism || "",
      required_conditions: data.required_conditions || "",
      challenge_question: data.challenge_question || "",
    });
  };

  const allHaveVerdict = items.every((i) => i.verdict);
  const atLeastOneInverted = items.some((i) => i.counter_position.trim().length > 0);
  const canContinue = allHaveVerdict && atLeastOneInverted;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 32px 80px" }}>
      <StageHeader stage={3} name="Inversion" subtitle="The Inversion Ledger" />

      <div style={{ background: "#0A1628", color: "white", borderRadius: 12, padding: 24, lineHeight: 1.55, fontSize: 15 }}>
        Stage 3 requires an adversarial examination. The AI Adversarial Judge will construct the strongest possible
        counter-position for each belief. Your role is to defend the original belief against the counter-position and
        render a verdict.
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: "#FFFBEB",
          border: "1px solid rgba(217,119,6,0.2)",
          borderRadius: 8,
          color: "#78350F",
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        For high-stakes decisions: the framework requires at least one external judge — a colleague from a different
        function, a board member, or an advisor who does not share your incentive structure. The AI is a starting point,
        not a substitute.
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, fontSize: 13 }}>{error}</div>}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        {loadBearing.map((b) => {
          const item = items.find((i) => i.belief_id === b.id)!;
          const inf = inference.find((i) => i.belief_id === b.id);
          return (
            <div key={b.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB" }}>
              <div style={{ background: "white", padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#0A1628", lineHeight: 1.5 }}>{b.belief}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                  Classification: <strong>{inf?.classification?.replace("_", "-") || "—"}</strong>
                </div>
                {inf?.defence_statement && (
                  <div style={{ marginTop: 8, padding: 10, background: "#FAFAFA", borderRadius: 6, fontSize: 13, color: "#374151" }}>
                    <em>Defence:</em> {inf.defence_statement}
                  </div>
                )}
              </div>

              <div style={{ background: "#0A1628", padding: 20, color: "white" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#D97706", letterSpacing: "0.08em" }}>
                  AI ADVERSARIAL JUDGE
                </div>
                {!item.counter_position ? (
                  <button
                    onClick={() => invert(b.id)}
                    disabled={loadingFor === b.id}
                    style={{
                      marginTop: 14,
                      background: "white",
                      color: "#0A1628",
                      border: "1px solid #D97706",
                      fontWeight: 500,
                      fontSize: 13,
                      padding: "8px 16px",
                      borderRadius: 980,
                      cursor: "pointer",
                    }}
                  >
                    {loadingFor === b.id ? "Generating…" : "Generate counter-position"}
                  </button>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 14, lineHeight: 1.55 }}>{item.counter_position}</div>
                    {item.mechanism && (
                      <div style={{ marginTop: 10, fontSize: 13, color: "#FBBF24" }}>
                        <strong>Mechanism:</strong> {item.mechanism}
                      </div>
                    )}
                    {item.required_conditions && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                        <strong>Required conditions:</strong> {item.required_conditions}
                      </div>
                    )}
                    {item.challenge_question && (
                      <div style={{ marginTop: 14, fontSize: 16, fontStyle: "italic", color: "white", lineHeight: 1.5 }}>
                        {item.challenge_question}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ background: "white", padding: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#0A1628" }}>
                  Your response
                </label>
                <textarea
                  value={item.response}
                  onChange={(e) => update(b.id, { response: e.target.value })}
                  placeholder="State your response to the counter-position. What evidence do you have? What does the challenge question reveal about your belief?"
                  style={{
                    width: "100%",
                    marginTop: 6,
                    minHeight: 80,
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#0A1628",
                    outline: "none",
                    resize: "vertical",
                  }}
                />

                <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: "#78350F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Verdict
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                  {VERDICTS.map((v) => {
                    const active = item.verdict === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => update(b.id, { verdict: v.id })}
                        style={{
                          background: active ? v.bg : "white",
                          border: `1.5px solid ${active ? v.border : "#E5E7EB"}`,
                          color: active ? v.fg : "#6B7280",
                          padding: "10px 8px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          cursor: "pointer",
                        }}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>

                {item.verdict === "survive_modified" && (
                  <textarea
                    value={item.modification_note}
                    onChange={(e) => update(b.id, { modification_note: e.target.value })}
                    placeholder="Describe the modification that allows this belief to survive."
                    style={{
                      width: "100%",
                      marginTop: 10,
                      minHeight: 60,
                      border: "1px solid #FCD34D",
                      borderRadius: 8,
                      padding: 10,
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "#0A1628",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ContinueBar
        canContinue={canContinue}
        disabledReason="Generate at least one counter-position and render a verdict for every belief."
        onClick={async () => {
          await updateSession(session.id, { stage3_inversion: items, status: "stage3_complete" });
          onSaved({ ...session, stage3_inversion: items, status: "stage3_complete" });
          onContinue();
        }}
        label="Continue to Stage 4 →"
      />
    </div>
  );
}
