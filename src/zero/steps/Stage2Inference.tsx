import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Classification, InferenceItem, updateSession, ZeroSessionRow } from "@/lib/zeroSessions";
import { StageHeader, ContinueBar } from "./Stage1Identification";

const OPTIONS: { id: Classification; label: string; body: string; bg: string; border: string }[] = [
  {
    id: "structurally_true",
    label: "Structurally-true",
    body: "The belief has a mechanism. It holds because of how the system works — independent of what has happened before.",
    bg: "#F0FDF4",
    border: "#86EFAC",
  },
  {
    id: "precedent_true",
    label: "Precedent-true",
    body: "Supported by what has worked before. The mechanism is not articulated — it relies on the precedent holding.",
    bg: "#FFFBEB",
    border: "#FCD34D",
  },
  {
    id: "analogy_true",
    label: "Analogy-true",
    body: "Held because a comparable organisation holds it. The transfer mechanism to your context is not verified.",
    bg: "#FFF1F2",
    border: "#FDA4AF",
  },
];

export function Stage2Inference({ session, onSaved, onContinue }: {
  session: ZeroSessionRow;
  onSaved: (next: ZeroSessionRow) => void;
  onContinue: () => void;
}) {
  const loadBearing = (session.stage1_register || []).filter((b) => b.load_bearing);
  const [items, setItems] = useState<InferenceItem[]>(() => {
    const existing = session.stage2_inference || [];
    return loadBearing.map((b) => {
      const found = existing.find((i) => i.belief_id === b.id);
      return found || { belief_id: b.id, classification: null, reasoning: "", defence_statement: "" };
    });
  });
  const [loadingFor, setLoadingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Persist intermediate state for autosave
    updateSession(session.id, { stage2_inference: items });
  }, [items, session.id]);

  const update = (id: string, patch: Partial<InferenceItem>) =>
    setItems((xs) => xs.map((x) => (x.belief_id === id ? { ...x, ...patch } : x)));

  const suggest = async (beliefId: string) => {
    const b = loadBearing.find((x) => x.id === beliefId);
    if (!b) return;
    setError(null);
    setLoadingFor(beliefId);
    const { data, error: err } = await supabase.functions.invoke("zero-stage2-classify", {
      body: {
        decision: session.decision_text,
        belief: b.belief,
        named_source: b.named_source,
        date_established: b.date_established,
      },
    });
    setLoadingFor(null);
    if (err || !data?.classification) {
      setError(data?.error || err?.message || "Suggestion failed");
      return;
    }
    const cls = String(data.classification).toLowerCase().replace(/[\s-]/g, "_") as Classification;
    update(beliefId, {
      classification: ["structurally_true", "precedent_true", "analogy_true"].includes(cls) ? cls : null,
      reasoning: data.reasoning || "",
      defence_statement: data.defence_statement || "",
    });
  };

  const canContinue = items.every((i) => i.classification && i.defence_statement.trim().length > 10);

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 32px 80px" }}>
      <StageHeader stage={2} name="Inference" subtitle="The Inference Map" />
      <div
        style={{
          background: "#FFFBEB",
          border: "1px solid rgba(217,119,6,0.2)",
          borderRadius: 12,
          padding: 20,
          color: "#78350F",
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        Classify each belief by the type of truth it claims. The classification determines how hard it must be tested.
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {loadBearing.map((b) => {
          const item = items.find((i) => i.belief_id === b.id)!;
          return (
            <div key={b.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 20, background: "white" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#0A1628", lineHeight: 1.5 }}>{b.belief}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                Source: {b.named_source || "—"} · {b.date_established || "—"}
              </div>

              <button
                onClick={() => suggest(b.id)}
                disabled={loadingFor === b.id}
                style={{
                  marginTop: 14,
                  background: "white",
                  border: "1px solid #D97706",
                  color: "#D97706",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 980,
                  cursor: "pointer",
                }}
              >
                {loadingFor === b.id ? "Thinking…" : "Suggest classification"}
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
                {OPTIONS.map((o) => {
                  const active = item.classification === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => update(b.id, { classification: o.id })}
                      style={{
                        textAlign: "left",
                        background: active ? o.bg : "white",
                        border: `1.5px solid ${active ? o.border : "#E5E7EB"}`,
                        borderRadius: 10,
                        padding: 12,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0A1628", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {o.label}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6, lineHeight: 1.4 }}>{o.body}</div>
                    </button>
                  );
                })}
              </div>

              {item.reasoning && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    background: "#FFFBEB",
                    border: "1px solid rgba(217,119,6,0.15)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#78350F",
                    lineHeight: 1.45,
                  }}
                >
                  <strong>AI reasoning:</strong> {item.reasoning}
                </div>
              )}

              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#78350F", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 14 }}>
                Defence statement
              </label>
              <textarea
                value={item.defence_statement}
                onChange={(e) => update(b.id, { defence_statement: e.target.value })}
                placeholder="Why is this belief true? State the mechanism, not the precedent."
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
            </div>
          );
        })}
      </div>

      <ContinueBar
        canContinue={canContinue}
        disabledReason="Classify each belief and write a defence statement before continuing."
        onClick={async () => {
          await updateSession(session.id, { stage2_inference: items, status: "stage2_complete" });
          onSaved({ ...session, stage2_inference: items, status: "stage2_complete" });
          onContinue();
        }}
        label="Continue to Stage 3 →"
      />
    </div>
  );
}
