import { Link } from "react-router-dom";
import { ZeroSessionRow, verdictColor, verdictLabel } from "@/lib/zeroSessions";

interface Props {
  sessions: ZeroSessionRow[];
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

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function ZeroSessionList({ sessions, selectedId, onSelect }: Props) {
  return (
    <aside
      style={{
        width: 280,
        borderRight: "1px solid rgba(217,119,6,0.15)",
        padding: "24px 16px",
        background: "#FAFBFC",
        overflow: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 8px 12px" }}>
        <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14, color: "#0A1628", margin: 0 }}>
          Examination History
        </h3>
      </div>
      <Link
        to="/zero/new"
        style={{ display: "block", padding: "0 8px 16px", color: "#D97706", fontSize: 13, fontWeight: 500 }}
      >
        + New examination
      </Link>

      {sessions.length === 0 ? (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: "#6B7280" }}>No examinations yet</div>
          <Link to="/zero/new" style={{ color: "#D97706", fontSize: 13, marginTop: 6, display: "inline-block" }}>
            Run your first →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {sessions.map((s) => {
            const active = s.id === selectedId;
            const inProgress = s.status !== "completed";
            const v = s.overall_verdict;
            const colors = verdictColor(v);
            const label = inProgress ? "IN PROGRESS" : verdictLabel(v);
            const title = s.decision_text?.trim() || "Untitled examination";
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                style={{
                  textAlign: "left",
                  width: "100%",
                  background: active ? "#FFFBEB" : "white",
                  border: `1px solid ${active ? "rgba(217,119,6,0.3)" : "transparent"}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: "#0A1628", lineHeight: 1.35 }}>
                  {trunc(title, 60)}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                  <span
                    style={{
                      background: inProgress ? "#F3F4F6" : colors.bg,
                      color: inProgress ? "#6B7280" : colors.fg,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      padding: "3px 8px",
                      borderRadius: 980,
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{timeAgo(s.created_at)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
