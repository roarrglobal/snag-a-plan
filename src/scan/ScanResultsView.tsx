import { PILLARS } from "@/scan/pillars";
import { formatMoney, statusFor } from "@/scan/calc";
import { ScanSessionRow } from "@/lib/scanSessions";
import { Link } from "react-router-dom";

interface Props {
  session: ScanSessionRow;
}

export function ScanResultsView({ session }: Props) {
  const binding = session.binding_constraint || {};
  const impact = session.financial_impact || {};
  const inputs = session.company_inputs || {};
  const pillarScores: any[] = Array.isArray(session.pillar_scores) ? session.pillar_scores : [];
  const currency = inputs.currency || "$";

  return (
    <div style={{ padding: 32, maxWidth: 1200, fontFamily: "Inter, sans-serif", color: "#0A1628" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="lg:grid-cols-[3fr_2fr]">
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Binding constraint */}
          <div
            style={{
              background: "#FFF1F2",
              border: "1px solid rgba(190,52,85,0.25)",
              borderRadius: 16,
              padding: 32,
            }}
          >
            <div style={{ fontSize: 11, color: "#881337", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Binding Constraint
            </div>
            <h2 style={{ fontWeight: 600, fontSize: 28, color: "#881337", marginTop: 8 }}>
              {binding.pillar_name || "—"}
            </h2>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 14, color: "#6B7280" }}>
              <span>Score: <strong style={{ color: "#0A1628" }}>{binding.score ?? 0}/25</strong></span>
              <span>Tier: {binding.tier}</span>
            </div>

            {Array.isArray(binding.evidence) && binding.evidence.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: "#881337", fontWeight: 600, marginBottom: 8 }}>EVIDENCE</div>
                {binding.evidence.map((e: any, i: number) => (
                  <div key={i} style={{ padding: "10px 0", borderTop: i ? "1px solid rgba(190,52,85,0.15)" : "none", fontSize: 13, color: "#1E3A5F" }}>
                    <div>{e.question}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Scored: {e.score}/5</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial impact */}
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid rgba(0,71,171,0.2)",
              borderRadius: 16,
              padding: 32,
            }}
          >
            <div style={{ fontSize: 11, color: "#1E3A5F", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Estimated annual financial impact
            </div>
            <div style={{ fontWeight: 600, fontSize: 36, color: "#0047AB", marginTop: 8 }}>
              {formatMoney(impact.total_impact ?? 0, currency)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              <ImpactRow label="Win-rate improvement" value={formatMoney(impact.win_rate_impact ?? 0, currency)} />
              <ImpactRow label="Forecast accuracy" value={formatMoney(impact.forecast_impact ?? 0, currency)} />
              <ImpactRow label="Pipeline quality" value={formatMoney(impact.pipeline_impact ?? 0, currency)} />
              <ImpactRow label="NRR uplift" value={formatMoney(impact.nrr_impact ?? 0, currency)} />
            </div>
          </div>

          {/* Pillar breakdown */}
          <div
            style={{
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h3 style={{ fontWeight: 600, fontSize: 16, color: "#0A1628", marginBottom: 16 }}>Pillar breakdown</h3>
            {PILLARS.map((p) => {
              const row = pillarScores.find((r: any) => r.pillar_number === p.id);
              const total = row?.total ?? 0;
              const s = statusFor(total);
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: p.id === 1 ? "none" : "1px solid #F3F4F6" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.code} · {p.name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.tier}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0A1628", minWidth: 50, textAlign: "right" }}>{total}/25</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
              position: "sticky",
              top: 16,
            }}
          >
            <h3 style={{ fontWeight: 600, fontSize: 14, color: "#0A1628" }}>Next steps</h3>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <Link to={`/zero/new?scan_session_id=${session.id}`} style={nextStepLink}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#D97706" }}>Examine load-bearing beliefs →</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Run ZERO on the constraint above.</div>
              </Link>
              <Link to="/analyze" style={nextStepLink}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#BE3455" }}>Gate the next decision →</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Run SNAG before you commit resources.</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const nextStepLink: React.CSSProperties = {
  display: "block",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 14,
  textDecoration: "none",
};

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "white", border: "1px solid rgba(0,71,171,0.15)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#0A1628", marginTop: 2 }}>{value}</div>
    </div>
  );
}
