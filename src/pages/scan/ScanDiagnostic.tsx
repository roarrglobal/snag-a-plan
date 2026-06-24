import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NerveShell } from "@/scan/NerveShell";
import { PILLARS } from "@/scan/pillars";
import { emptyScores, isPillarComplete, pillarTotal, Scores, computeBindingConstraint } from "@/scan/calc";
import { RadarPanel } from "@/scan/RadarPanel";

const SCORE_KEY = "nerve_scan_scores";
const EVIDENCE_KEY = "nerve_scan_evidence";

export default function ScanDiagnostic() {
  const navigate = useNavigate();
  const [pillarIdx, setPillarIdx] = useState(0);
  const [scores, setScores] = useState<Scores>(() => {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return emptyScores();
  });
  const [evidence, setEvidence] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(EVIDENCE_KEY) || "{}");
    } catch { return {}; }
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
  }, [scores]);
  useEffect(() => {
    localStorage.setItem(EVIDENCE_KEY, JSON.stringify(evidence));
  }, [evidence]);

  const pillar = PILLARS[pillarIdx];
  const totalPillars = PILLARS.length;
  const completedCount = PILLARS.filter((p) => isPillarComplete(scores[p.id])).length;
  const pctComplete = Math.round((completedCount / totalPillars) * 100);

  const currentTouched = useMemo(
    () => pillar.questions.every((_, qi) => touched[`${pillar.id}-${qi}`]),
    [touched, pillar]
  );

  const setScore = (qi: number, val: number) => {
    setScores((prev) => {
      const next = { ...prev, [pillar.id]: [...prev[pillar.id]] };
      next[pillar.id][qi] = val;
      return next;
    });
    setTouched((t) => ({ ...t, [`${pillar.id}-${qi}`]: true }));
  };

  const next = () => {
    if (pillarIdx < totalPillars - 1) {
      setPillarIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/scan/results");
    }
  };

  const prev = () => {
    if (pillarIdx > 0) {
      setPillarIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const bindingPreview = completedCount >= 4 ? computeBindingConstraint(scores) : null;

  return (
    <NerveShell>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              Pillar {pillarIdx + 1} of {totalPillars} — {pillar.name}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              {pctComplete}% complete
            </span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${(pillarIdx / totalPillars) * 100 + (currentTouched ? 100 / totalPillars : 0)}%`,
                height: "100%",
                background: "#0047AB",
                transition: "width 250ms",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* LEFT: questions */}
          <div>
            {/* Pillar nav */}
            <div className="flex flex-wrap gap-2 mb-6">
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
                      border: `1px solid ${active ? "#0047AB" : "rgba(255,255,255,0.15)"}`,
                      background: active ? "rgba(0,71,171,0.2)" : "transparent",
                      color: done || active ? "white" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {p.code} {done && "✓"}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(0,71,171,0.2)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div className="mb-6">
                <div style={{ color: "#0047AB", fontWeight: 600, fontSize: 13, letterSpacing: "0.1em" }}>
                  {pillar.code}
                </div>
                <h2 style={{ fontWeight: 500, fontSize: 24, marginTop: 4 }}>{pillar.name}</h2>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {pillar.tier}
                </div>
              </div>

              {pillar.questions.map((q, qi) => {
                const key = `${pillar.id}-${qi}`;
                const score = scores[pillar.id][qi] ?? 3;
                const isTouched = !!touched[key];
                return (
                  <div key={qi} style={{ marginBottom: 32 }}>
                    <p style={{ lineHeight: 1.6, fontSize: 15 }}>{q}</p>
                    <div style={{ marginTop: 16, marginBottom: 6, textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        background: "#0047AB",
                        color: "white",
                        padding: "2px 10px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 600,
                        opacity: isTouched ? 1 : 0.4,
                      }}>{score}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={score}
                      onChange={(e) => setScore(qi, Number(e.target.value))}
                      className="w-full"
                      style={{ accentColor: "#0047AB" }}
                    />
                    <div className="flex justify-between" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                      <span>1 — Does not exist or actively broken</span>
                      <span>5 — Defined, measured, improving QoQ</span>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Evidence (optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Optional: note the evidence behind your score"
                        value={evidence[key] || ""}
                        onChange={(e) => setEvidence({ ...evidence, [key]: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-md outline-none"
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(0,71,171,0.3)",
                          color: "white",
                          fontSize: 13,
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {pillarIdx > 0 ? (
                  <button onClick={prev} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                    ← Previous Pillar
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
                    fontWeight: 500,
                    opacity: currentTouched ? 1 : 0.4,
                    cursor: currentTouched ? "pointer" : "not-allowed",
                  }}
                >
                  {pillarIdx === totalPillars - 1 ? "View Diagnostic Results →" : "Next Pillar →"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: live summary */}
          <aside className="space-y-4 lg:sticky lg:top-4 self-start">
            <RadarPanel scores={scores} />
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(0,71,171,0.2)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              {PILLARS.map((p) => {
                const total = pillarTotal(scores[p.id]);
                const complete = isPillarComplete(scores[p.id]);
                return (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div className="flex justify-between" style={{ fontSize: 12 }}>
                      <span style={{ color: complete ? "white" : "rgba(255,255,255,0.4)" }}>
                        {p.code} {p.name}
                      </span>
                      <span style={{ color: complete ? "white" : "rgba(255,255,255,0.4)" }}>
                        {complete ? `${total}/25` : "—/25"}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 4 }}>
                      <div style={{ width: `${(total / 25) * 100}%`, height: "100%", background: "#0047AB", borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {bindingPreview && (
              <div
                style={{
                  background: "rgba(190,52,85,0.06)",
                  border: "1px solid rgba(190,52,85,0.3)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Current binding constraint
                </div>
                <div style={{ color: "#BE3455", fontWeight: 600, fontSize: 18, marginTop: 6 }}>
                  {bindingPreview.pillarName}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  {bindingPreview.total}/25
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                  This updates as you complete each pillar
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </NerveShell>
  );
}
