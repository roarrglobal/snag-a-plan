import { ScanSessionRow } from "@/lib/scanSessions";
import { Link } from "react-router-dom";
import { formatMoney } from "@/scan/calc";

interface Props {
  sessions: ScanSessionRow[];
  onSelect: (id: string) => void;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

export function ScanOverview({ sessions, onSelect }: Props) {
  const completed = sessions.filter((s) => s.status === "completed" && s.binding_constraint);
  if (completed.length === 0) return null;

  const latest = completed[0];
  const previous = completed[1];

  // Most common constraint
  const counts: Record<string, number> = {};
  for (const s of completed) {
    const name = s.binding_constraint?.pillar_name;
    if (name) counts[name] = (counts[name] || 0) + 1;
  }
  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const latestScore = latest?.binding_constraint?.score ?? 0;
  const prevScore = previous?.binding_constraint?.score ?? null;
  const trendDelta = prevScore !== null ? latestScore - prevScore : null;

  return (
    <div style={{ padding: 32, fontFamily: "Inter, sans-serif", color: "#0A1628" }}>
      <h1 style={{ fontWeight: 300, fontSize: 24, color: "#0A1628", margin: 0 }}>
        Your Revenue System Overview
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 24 }}>
        <StatCard label="Scans completed" value={String(completed.length)} />
        <StatCard label="Most common constraint" value={mostCommon} small />
        <StatCard label="Latest score" value={`${latestScore}/25`} />
        <StatCard
          label="Trend"
          value={
            trendDelta === null
              ? "—"
              : trendDelta > 0
              ? `↑ +${trendDelta}`
              : trendDelta < 0
              ? `↓ ${trendDelta}`
              : "0"
          }
          color={trendDelta === null ? undefined : trendDelta > 0 ? "#166534" : trendDelta < 0 ? "#BE3455" : "#0A1628"}
        />
      </div>

      <h2 style={{ fontWeight: 500, fontSize: 16, marginTop: 40, marginBottom: 12 }}>Recent sessions</h2>
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#FAFBFC", color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>ARR</th>
              <th style={th}>Binding Constraint</th>
              <th style={th}>Score</th>
              <th style={th}>Impact</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {completed.slice(0, 5).map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                <td style={td}>{timeAgo(s.created_at)}</td>
                <td style={td}>{s.company_inputs?.arr ? `$${Math.round(s.company_inputs.arr / 1_000_000)}M` : "—"}</td>
                <td style={td}>{s.binding_constraint?.pillar_name ?? "—"}</td>
                <td style={td}>{s.binding_constraint?.score ?? 0}/25</td>
                <td style={td}>{formatMoney(s.financial_impact?.total_impact ?? 0)}</td>
                <td style={td}>
                  <button
                    onClick={() => onSelect(s.id)}
                    style={{ color: "#0047AB", fontWeight: 500, fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <Link to="/scan/reports" style={{ color: "#0047AB", fontSize: 13, fontWeight: 500 }}>
          View reports →
        </Link>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "10px 14px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "12px 14px", color: "#1E3A5F" };

function StatCard({ label, value, small, color }: { label: string; value: string; small?: boolean; color?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: small ? 16 : 24, fontWeight: 600, color: color || "#0A1628", marginTop: 8, lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}
