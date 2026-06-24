import { useEffect, useMemo, useRef, useState } from "react";
import { PILLARS } from "@/scan/pillars";
import { emptyScores, isPillarComplete, pillarTotal, Scores, computeBindingConstraint } from "@/scan/calc";
import { RadarPanel } from "@/scan/RadarPanel";
import { autosavePillarScores } from "@/lib/scanSessions";

interface Props {
  sessionId: string;
  initialScores?: Scores | null;
  initialPillarIdx?: number;
  onComplete: (scores: Scores) => void;
}

export function PillarsStep({ sessionId, initialScores, initialPillarIdx, onComplete }: Props) {
  const [scores, setScores] = useState<Scores>(initialScores || emptyScores());
  const [pillarIdx, setPillarIdx] = useState(initialPillarIdx ?? 0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const saveTimer = useRef<number | null>(null);

  const pillar = PILLARS[pillarIdx];
  const totalPillars = PILLARS.length;
  const completedCount = PILLARS.filter((p) => isPillarComplete(scores[p.id])).length;

  const currentTouched = useMemo(
    () => pillar.questions.every((_, qi) => touched[`${pillar.id}-${qi}`] || scores[pillar.id][qi] !== null),
    [touched, pillar, scores]
  );

  // Debounced autosave
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      autosavePillarScores(sessionId, scores).catch(() => {});
    }, 800);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [scores, sessionId]);

  const setScore = (qi: number, val: number) => {
    setScores((prev) => {
      const next = { ...prev, [pillar.id]: [...prev[pillar.id]] };
      next[pillar.id][qi] = val;
      return next;
    });
    setTouched((t) => ({ ...t, [`${pillar.id}-${qi}`]: true }));
  };

  const next = async () => {
    if (pillarIdx < totalPillars - 1) {
      setPillarIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final save then complete
      await autosavePillarScores(sessionId, scores);
      onComplete(scores);
    }
  };

  const prev = () => pillarIdx > 0 && setPillarIdx((i) => i - 1);

  const allComplete = completedCount === totalPillars;
  const bindingPreview = completedCount >= 4 ? computeBindingConstraint(scores) : null;

  return (
    <div style={{ padding: "0 32px 48px", fontFamily: "Inter, sans-serif", color: "#0A1628" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="lg:grid-cols-[1fr_320px]">
        <div>
          {/* Pillar nav */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {PILLARS.map((p, i) => {
              const done = isPillarComplete(scores[p.id]);
              const active = i === pillarIdx;
              return (
                <button
                  key={p.id}
                  onClick={() => setPillarIdx(i)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    border: `1px solid ${active ? "#0047AB" : "rgba(0,71,171,0.15)"}`,
                    background: active ? "#EFF6FF" : "white",
                    color: done || active ? "#0A1628" : "#9CA3AF",
                    cursor: "pointer",
                  }}
                >
                  {p.code} {done && "✓"}
                </button>
              );
            })}
          </div>

          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#0047AB", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em" }}>{pillar.code}</div>
              <h2 style={{ fontWeight: 500, fontSize: 22, marginTop: 4, color: "#0A1628" }}>{pillar.name}</h2>
              <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {pillar.tier}
              </div>
            </div>

            {pillar.questions.map((q, qi) => {
              const key = `${pillar.id}-${qi}`;
              const score = scores[pillar.id][qi] ?? 3;
              const isTouched = !!touched[key] || scores[pillar.id][qi] !== null;
              return (
                <div key={qi} style={{ marginBottom: 28 }}>
                  <p style={{ lineHeight: 1.55, fontSize: 14, color: "#1E3A5F" }}>{q}</p>
                  <div style={{ marginTop: 12, marginBottom: 4, textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: "#0047AB",
                        color: "white",
                        padding: "2px 10px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 600,
                        opacity: isTouched ? 1 : 0.35,
                      }}
                    >
                      {score}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={score}
                    onChange={(e) => setScore(qi, Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#0047AB" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                    <span>1 — Broken / absent</span>
                    <span>5 — Measured, improving</span>
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
              {pillarIdx > 0 ? (
                <button onClick={prev} style={{ color: "#6B7280", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
                  ← Previous
                </button>
              ) : <span />}
              <button
                onClick={next}
                disabled={!currentTouched}
                style={{
                  background: "#0047AB",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: currentTouched ? "pointer" : "not-allowed",
                  opacity: currentTouched ? 1 : 0.4,
                }}
              >
                {pillarIdx === totalPillars - 1
                  ? allComplete
                    ? "View Results →"
                    : "Complete all pillars"
                  : "Next Pillar →"}
              </button>
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RadarPanel scores={scores} />
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
            {PILLARS.map((p) => {
              const total = pillarTotal(scores[p.id]);
              const complete = isPillarComplete(scores[p.id]);
              return (
                <div key={p.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: complete ? "#0A1628" : "#9CA3AF" }}>{p.code} {p.name}</span>
                    <span style={{ color: complete ? "#0A1628" : "#9CA3AF" }}>{complete ? `${total}/25` : "—/25"}</span>
                  </div>
                  <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, marginTop: 4 }}>
                    <div style={{ width: `${(total / 25) * 100}%`, height: "100%", background: "#0047AB", borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
          {bindingPreview && (
            <div style={{ background: "#FFF1F2", border: "1px solid rgba(190,52,85,0.25)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#881337", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                Current binding constraint
              </div>
              <div style={{ color: "#BE3455", fontWeight: 600, fontSize: 16, marginTop: 6 }}>{bindingPreview.pillarName}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{bindingPreview.total}/25</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
