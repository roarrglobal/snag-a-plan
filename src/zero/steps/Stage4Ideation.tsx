import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MatrixElement, Stage4Matrix, updateSession, ZeroSessionRow } from "@/lib/zeroSessions";
import { StageHeader, ContinueBar } from "./Stage1Identification";
import { AlertTriangle } from "lucide-react";

export function Stage4Ideation({ session, onSaved, onContinue }: {
  session: ZeroSessionRow;
  onSaved: (next: ZeroSessionRow) => void;
  onContinue: () => void;
}) {
  const beliefs = session.stage1_register || [];
  const inversion = session.stage3_inversion || [];
  const surviving = inversion.filter((i) => i.verdict === "survive" || i.verdict === "survive_modified");
  const failed = inversion.filter((i) => i.verdict === "fail");

  const beliefText = (id: string) => beliefs.find((b) => b.id === id)?.belief || "(belief)";

  const [matrix, setMatrix] = useState<Stage4Matrix | null>(session.stage4_matrix || null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const generate = async () => {
    setError(null);
    setGenerating(true);
    const { data, error: err } = await supabase.functions.invoke("zero-stage4-ideation", {
      body: {
        decision: session.decision_text,
        surviving: surviving.map((s) => ({
          belief: beliefText(s.belief_id),
          verdict: s.verdict,
          modification: s.modification_note,
        })),
        failed: failed.map((f) => beliefText(f.belief_id)),
      },
    });
    setGenerating(false);
    if (err || !data?.elements) {
      setError(data?.error || err?.message || "Generation failed");
      return;
    }
    setMatrix({
      conclusion_summary: data.conclusion_summary || "",
      elements: (data.elements || []).map((e: any) => ({
        element: e.element || "",
        supporting_irreducibles: Array.isArray(e.supporting_irreducibles) ? e.supporting_irreducibles : [],
        status: e.status === "smuggled" ? "smuggled" : "grounded",
        smuggling_note: e.smuggling_note || null,
      })),
    });
  };

  const updateElement = (idx: number, patch: Partial<MatrixElement>) => {
    if (!matrix) return;
    const next = { ...matrix, elements: matrix.elements.map((e, i) => (i === idx ? { ...e, ...patch } : e)) };
    setMatrix(next);
  };

  const removeElement = (idx: number) => {
    if (!matrix) return;
    setMatrix({ ...matrix, elements: matrix.elements.filter((_, i) => i !== idx) });
  };

  const noSmuggled = !!matrix && matrix.elements.every((e) => e.status === "grounded");
  const canContinue = !!matrix && noSmuggled && matrix.elements.length > 0;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 32px 80px" }}>
      <StageHeader stage={4} name="Ideation" subtitle="The Traceability Matrix" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Examined" value={inversion.length} />
        <Stat label="Surviving" value={surviving.length} color="#166534" />
        <Stat label="Failed" value={failed.length} color="#991B1B" />
      </div>

      {failed.length > 0 && (
        <div style={{ marginTop: 16, padding: 14, background: "#FFF1F2", border: "1px solid rgba(190,52,85,0.2)", borderRadius: 8, color: "#881337", fontSize: 13, lineHeight: 1.5 }}>
          <strong>Warning:</strong> {failed.length} belief(s) failed the examination. Do not build the conclusion on
          failed beliefs. Any conclusion element that traces only to a failed belief is smuggling.
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={generate}
          disabled={generating || surviving.length === 0}
          style={{
            background: surviving.length === 0 ? "#E5E7EB" : "#D97706",
            color: surviving.length === 0 ? "#9CA3AF" : "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: 980,
            fontWeight: 500,
            fontSize: 14,
            cursor: surviving.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {generating ? "Building matrix…" : matrix ? "Rebuild Traceability Matrix" : "Build Traceability Matrix"}
        </button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, fontSize: 13 }}>{error}</div>}

      {matrix && (
        <div style={{ marginTop: 24 }}>
          {matrix.conclusion_summary && (
            <div style={{ padding: 16, background: "#FFFBEB", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 10, fontSize: 14, color: "#78350F", lineHeight: 1.55 }}>
              <strong>Conclusion:</strong> {matrix.conclusion_summary}
            </div>
          )}

          <div style={{ marginTop: 16, border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 0.8fr 0.6fr", padding: "12px 16px", background: "#F9FAFB", fontSize: 11, fontWeight: 700, color: "#78350F", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <div>Conclusion element</div>
              <div>Supporting irreducibles</div>
              <div>Status</div>
              <div></div>
            </div>
            {matrix.elements.map((e, i) => {
              const isEditing = editingIdx === i;
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 0.8fr 0.6fr",
                    padding: "14px 16px",
                    background: e.status === "smuggled" ? "#FFF1F2" : "white",
                    borderTop: "1px solid #F3F4F6",
                    fontSize: 13,
                    color: "#0A1628",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {isEditing ? (
                    <textarea
                      value={e.element}
                      onChange={(ev) => updateElement(i, { element: ev.target.value })}
                      style={{ width: "100%", minHeight: 60, padding: 8, border: "1px solid #E5E7EB", borderRadius: 6, fontFamily: "Inter, sans-serif", fontSize: 13 }}
                    />
                  ) : (
                    <div>{e.element}</div>
                  )}
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>
                    {e.supporting_irreducibles.join("; ") || "—"}
                  </div>
                  <div>
                    <span
                      style={{
                        background: e.status === "smuggled" ? "#FEE2E2" : "#DCFCE7",
                        color: e.status === "smuggled" ? "#991B1B" : "#166534",
                        padding: "3px 8px",
                        borderRadius: 980,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {e.status === "smuggled" && <AlertTriangle size={10} />}
                      {e.status.toUpperCase()}
                    </span>
                    {e.smuggling_note && (
                      <div style={{ fontSize: 11, color: "#991B1B", marginTop: 4, lineHeight: 1.35 }}>{e.smuggling_note}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {e.status === "smuggled" && (
                      <>
                        <button
                          onClick={() => updateElement(i, { status: "grounded", smuggling_note: null })}
                          style={miniBtn("#16A34A")}
                        >
                          Mark grounded
                        </button>
                        <button onClick={() => setEditingIdx(isEditing ? null : i)} style={miniBtn("#D97706")}>
                          {isEditing ? "Done" : "Edit"}
                        </button>
                        <button onClick={() => removeElement(i)} style={miniBtn("#BE3455")}>
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!noSmuggled && (
            <div style={{ marginTop: 14, fontSize: 13, color: "#991B1B" }}>
              Review each SMUGGLED element. Remove or revise it before proceeding. A conclusion built on failed beliefs
              will produce the same outcome that ZERO was designed to prevent.
            </div>
          )}
        </div>
      )}

      <ContinueBar
        canContinue={canContinue}
        disabledReason="Build the matrix and resolve every smuggled element before continuing."
        onClick={async () => {
          await updateSession(session.id, { stage4_matrix: matrix!, status: "stage4_complete" });
          onSaved({ ...session, stage4_matrix: matrix, status: "stage4_complete" });
          onContinue();
        }}
        label="Continue to Stage 5 →"
      />
    </div>
  );
}

function Stat({ label, value, color = "#0A1628" }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: 16, background: "white" }}>
      <div style={{ fontSize: 11, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 300, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const miniBtn = (color: string): React.CSSProperties => ({
  background: "white",
  color,
  border: `1px solid ${color}`,
  borderRadius: 980,
  fontSize: 10,
  fontWeight: 600,
  padding: "4px 8px",
  cursor: "pointer",
});
