import { Link } from "react-router-dom";
import { ScanSessionRow } from "@/lib/scanSessions";

interface Props {
  sessions: ScanSessionRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
};

const scoreColor = (score: number) => {
  if (score >= 20) return "#166534";
  if (score >= 13) return "#D97706";
  return "#BE3455";
};

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function ScanSessionList({ sessions, selectedId, onSelect }: Props) {
  return (
    <aside
      style={{
        width: 280,
        borderRight: "1px solid rgba(0,71,171,0.15)",
        padding: "24px 16px",
        background: "#FAFBFC",
        overflow: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 8px 16px" }}>
        <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14, color: "#0A1628", margin: 0 }}>
          Scan History
        </h3>
      </div>
      <Link
        to="/scan/new"
        style={{
          display: "block",
          padding: "0 8px 16px",
          color: "#0047AB",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        + New Scan
      </Link>

      {sessions.length === 0 ? (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: "#6B7280" }}>No scans yet</div>
          <Link to="/scan/new" style={{ color: "#0047AB", fontSize: 13, marginTop: 6, display: "inline-block" }}>
            Run your first scan →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {sessions.map((s) => {
            const active = s.id === selectedId;
            const isInProgress = s.status === "in_progress";
            const bindingName = s.binding_constraint?.pillar_name || (isInProgress ? "In progress" : "Untitled scan");
            const score = s.binding_constraint?.score ?? 0;
            const arr = s.company_inputs?.arr ?? 0;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                style={{
                  textAlign: "left",
                  width: "100%",
                  background: active ? "#EFF6FF" : "white",
                  border: `1px solid ${active ? "rgba(0,71,171,0.2)" : "transparent"}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0A1628", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {trunc(bindingName, 28)}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {arr ? `$${Math.round(arr / 1_000_000)}M` : "—"} · {timeAgo(s.created_at)}
                  </div>
                </div>
                {!isInProgress && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(score) }}>
                    {score}/25
                  </span>
                )}
                {isInProgress && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Draft
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
