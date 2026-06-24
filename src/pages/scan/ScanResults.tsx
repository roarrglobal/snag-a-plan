import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NerveShell } from "@/scan/NerveShell";
import { PILLARS, CALENDLY_URL } from "@/scan/pillars";
import {
  computeBindingConstraint,
  computeImpact,
  CompanyInputs,
  emptyScores,
  formatMoney,
  pillarTotal,
  Scores,
  statusFor,
} from "@/scan/calc";
import { RadarPanel } from "@/scan/RadarPanel";
import { useAuth } from "@/contexts/AuthContext";
import { saveScanSession } from "@/lib/saveScanSession";

export default function ScanResults() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const scores: Scores = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("nerve_scan_scores") || "") || emptyScores();
    } catch { return emptyScores(); }
  }, []);

  const inputs: CompanyInputs | null = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("nerve_scan_company_inputs") || "");
    } catch { return null; }
  }, []);

  const binding = useMemo(() => computeBindingConstraint(scores), [scores]);
  const impact = inputs ? computeImpact(inputs) : null;
  const currency = "$";

  const [saved, setSaved] = useState<boolean>(() => !!sessionStorage.getItem("nerve_scan_session_id"));

  useEffect(() => {
    const payload = {
      created_at: new Date().toISOString(),
      user_id: user?.id ?? null,
      company_inputs: inputs,
      scores,
      binding_constraint: binding,
      impact,
    };
    try {
      localStorage.setItem("nerve_scan_last_result", JSON.stringify(payload));
    } catch {}
  }, [user, inputs, scores, binding, impact]);

  useEffect(() => {
    if (!inputs || !impact) return;
    if (sessionStorage.getItem("nerve_scan_session_id")) return;
    saveScanSession({ companyInputs: inputs, scores, binding, impact }).then((res) => {
      if (res) setSaved(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!inputs) {
    return (
      <NerveShell>
        <main className="max-w-2xl mx-auto px-6 py-16">
          <p>No diagnostic data found. <button onClick={() => navigate("/scan")} style={{ color: "#0047AB" }}>Start over →</button></p>
        </main>
      </NerveShell>
    );
  }

  return (
    <NerveShell>
      {saved && (
        <div
          style={{
            background: "#EFF6FF",
            borderBottom: "1px solid rgba(0,71,171,0.2)",
            color: "#1E3A5F",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            padding: "12px 24px",
            width: "100%",
          }}
        >
          {user ? (
            <>
              Your diagnostic has been saved to your account.{" "}
              <Link to="/dashboard" style={{ color: "#0047AB", fontWeight: 500 }}>
                View all diagnostics →
              </Link>
            </>
          ) : (
            <>
              Save your diagnostic —{" "}
              <Link to="/signup?module=scan" style={{ color: "#0047AB", fontWeight: 500 }}>
                Create free account
              </Link>{" "}
              to access this report again and track improvement.
            </>
          )}
        </div>
      )}
      <main className="mx-auto px-6 py-10" style={{ maxWidth: 900 }}>
        <header className="mb-8">
          <h1 style={{ fontWeight: 600, fontSize: 32, letterSpacing: "-0.02em" }}>
            Your Revenue Structure Diagnostic
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 6 }}>
            ARR {formatMoney(inputs.arr, currency)} · Completed {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="mb-10">
          <RadarPanel scores={scores} large />
        </div>

        {/* Binding constraint callout */}
        <section
          style={{
            background: "rgba(190,52,85,0.05)",
            borderLeft: "4px solid #BE3455",
            borderRadius: 8,
            padding: 24,
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Binding Constraint
          </div>
          <h2 style={{ fontWeight: 600, fontSize: 28, marginTop: 6 }}>{binding.pillarName}</h2>
          <div style={{ fontSize: 14, marginTop: 4 }}>Scored {binding.total} out of 25</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{binding.tier}</div>

          <div style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Diagnostic evidence
          </div>
          <div style={{ marginTop: 10 }}>
            {binding.evidence.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ flex: 1, color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.5 }}>{ev.question}</span>
                <span style={{ color: "#0047AB", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>{ev.score} / 5</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 20, fontSize: 14, lineHeight: 1.6 }}>
            This pillar is creating downstream pressure on every tier below it. Fixing components
            above this level produces marginal improvement until this constraint is resolved.
          </p>
        </section>

        {/* Pillar breakdown */}
        <section className="mb-10">
          <h3 style={{ fontWeight: 500, fontSize: 18, marginBottom: 12 }}>Pillar breakdown</h3>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,71,171,0.08)" }}>
                  <th style={th}>Pillar</th>
                  <th style={th}>Tier</th>
                  <th style={th}>Score</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {PILLARS.map((p) => {
                  const total = pillarTotal(scores[p.id]);
                  const st = statusFor(total);
                  const isBinding = p.id === binding.pillarId;
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderLeft: isBinding ? "3px solid #BE3455" : "3px solid transparent" }}>
                      <td style={td}>{p.code} · {p.name}</td>
                      <td style={td}>{p.tier}</td>
                      <td style={td}>{total}/25</td>
                      <td style={td}>
                        <span style={{ color: st.color, fontSize: 12, fontWeight: 500 }}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Impact */}
        {impact && (
          <section className="mb-10">
            <h3 style={{ fontWeight: 500, fontSize: 18, marginBottom: 12 }}>Estimated annual revenue impact</h3>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 8 }}>
              {[
                { label: "Win rate improvement (+5 points)", val: impact.winImprovement },
                { label: "Forecast accuracy improvement", val: impact.forecastImprovement },
                { label: "Pipeline quality rationalisation", val: impact.pipelineQuality },
                { label: "NRR improvement (+5 points)", val: impact.nrrImprovement },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{formatMoney(r.val, currency)} annually</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 12px" }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#BE3455" }}>Total estimated annual impact</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: "#BE3455" }}>{formatMoney(impact.total, currency)} annually</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
              Based on conservative improvement assumptions. Actual impact depends on intervention quality and execution discipline.
            </p>
          </section>
        )}

        {/* Next steps */}
        <section className="mb-10">
          <h3 style={{ fontWeight: 500, fontSize: 18, marginBottom: 12 }}>Next steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NextCard
              symbol="⊘"
              title="Examine the belief"
              body="ZERO surfaces why your binding constraint exists at the belief level — and whether the assumption driving it holds under first-principles scrutiny."
              cta="Run ZERO Examination →"
              onClick={() => {
                sessionStorage.setItem("nerve_scan_binding_constraint", JSON.stringify(binding));
                navigate("/zero");
              }}
              primary
            />
            <NextCard
              symbol="┼"
              title="Gate the intervention"
              body="Before committing resources to fixing your binding constraint, SNAG runs a pre-mortem. Surface the hidden assumption. Name the failure mode. Set the kill criterion."
              cta="Open SNAG Gate →"
              onClick={() => {
                sessionStorage.setItem("snag_prefill", JSON.stringify({
                  context: `Binding constraint: ${binding.pillarName} (${binding.total}/25). Evidence: ${binding.evidence.map(e => e.question).join(" | ")}`,
                }));
                navigate("/analyze");
              }}
            />
            <NextCard
              symbol="▣"
              title="Work with Mahesh directly"
              body="A full Revenue Integrity engagement applies this diagnostic to your live pipeline data with 30-year operator perspective."
              cta="Book 20 minutes →"
              onClick={() => window.open(CALENDLY_URL, "_blank")}
            />
          </div>
        </section>

        {!user && (
          <div
            style={{
              background: "rgba(0,71,171,0.08)",
              border: "1px solid rgba(0,71,171,0.3)",
              borderRadius: 8,
              padding: 16,
              fontSize: 14,
            }}
          >
            Save your diagnostic —{" "}
            <Link to="/signup" style={{ color: "#0047AB", fontWeight: 500 }}>Create free account</Link>{" "}
            to access this report later and track improvement over time.
          </div>
        )}
      </main>
    </NerveShell>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" };
const td: React.CSSProperties = { padding: "12px", fontSize: 14 };

function NextCard({ symbol, title, body, cta, onClick, primary }: { symbol: string; title: string; body: string; cta: string; onClick: () => void; primary?: boolean }) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,71,171,0.4)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "rgba(0,71,171,0.04)",
      }}
    >
      <div style={{ fontSize: 28, color: "#0047AB", lineHeight: 1 }}>{symbol}</div>
      <div style={{ fontWeight: 500, fontSize: 16 }}>{title}</div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, flex: 1 }}>{body}</p>
      <button
        onClick={onClick}
        style={{
          background: primary ? "#0047AB" : "transparent",
          border: primary ? "none" : "1px solid #0047AB",
          color: "white",
          padding: "10px 14px",
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {cta}
      </button>
    </div>
  );
}
