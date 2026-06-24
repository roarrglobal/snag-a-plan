import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ZeroShell } from "@/zero/ZeroShell";
import { ZeroSessionList } from "@/zero/ZeroSessionList";
import { ZeroEmptyHero } from "@/zero/ZeroOverview";
import { listSessions, ZeroSessionRow, verdictColor, verdictLabel } from "@/lib/zeroSessions";
import ZeroGate from "./ZeroGate";

export default function ZeroDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [sessions, setSessions] = useState<ZeroSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedId = params.get("session");

  useEffect(() => {
    if (!user) return;
    listSessions().then((s) => {
      setSessions(s);
      setLoading(false);
    });
  }, [user]);

  if (isLoading) return null;
  if (!user) return <ZeroGate />;

  const select = (id: string) => setParams({ session: id });
  const selected = sessions.find((s) => s.id === selectedId) || null;

  return (
    <ZeroShell>
      <div style={{ display: "flex", height: "calc(100vh - 56px - 56px)" }}>
        <ZeroSessionList sessions={sessions} selectedId={selectedId} onSelect={select} />

        <div style={{ flex: 1, overflow: "auto", background: "white" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>Loading…</div>
          ) : sessions.length === 0 ? (
            <ZeroEmptyHero />
          ) : selected ? (
            selected.status === "completed" ? (
              <SelectedComplete session={selected} onOpen={() => navigate(`/zero/${selected.id}`)} />
            ) : (
              <InProgress session={selected} onResume={() => navigate(`/zero/new?resume=${selected.id}`)} />
            )
          ) : (
            <ZeroEmptyHero />
          )}
        </div>
      </div>
    </ZeroShell>
  );
}

function SelectedComplete({ session, onOpen }: { session: ZeroSessionRow; onOpen: () => void }) {
  const colors = verdictColor(session.overall_verdict);
  return (
    <div style={{ padding: 48 }}>
      <span style={{ background: colors.bg, color: colors.fg, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 980 }}>
        {verdictLabel(session.overall_verdict)}
      </span>
      <h2 style={{ fontWeight: 400, fontSize: 24, color: "#0A1628", marginTop: 14, lineHeight: 1.4 }}>
        {session.decision_text}
      </h2>
      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 10 }}>
        {(session.stage1_register?.length ?? 0)} beliefs · examined {new Date(session.created_at).toLocaleDateString()}
      </div>
      <button
        onClick={onOpen}
        style={{ marginTop: 22, background: "#D97706", color: "white", border: "none", padding: "10px 20px", borderRadius: 980, fontWeight: 500, fontSize: 13, cursor: "pointer" }}
      >
        Open full examination →
      </button>
    </div>
  );
}

function InProgress({ session, onResume }: { session: ZeroSessionRow; onResume: () => void }) {
  return (
    <div style={{ padding: 48 }}>
      <span style={{ background: "#F3F4F6", color: "#6B7280", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 980 }}>
        IN PROGRESS
      </span>
      <h2 style={{ fontWeight: 400, fontSize: 22, color: "#0A1628", marginTop: 14 }}>{session.decision_text}</h2>
      <p style={{ color: "#6B7280", fontSize: 13, marginTop: 8 }}>Pick up where you left off — your stages are saved.</p>
      <button
        onClick={onResume}
        style={{ marginTop: 16, background: "#D97706", color: "white", border: "none", padding: "10px 20px", borderRadius: 980, fontWeight: 500, fontSize: 13, cursor: "pointer" }}
      >
        Resume →
      </button>
    </div>
  );
}
