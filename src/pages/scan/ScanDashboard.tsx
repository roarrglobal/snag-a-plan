import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScanShell } from "@/scan/ScanShell";
import { ScanSessionList } from "@/scan/ScanSessionList";
import { ScanOverview } from "@/scan/ScanOverview";
import { ScanResultsView } from "@/scan/ScanResultsView";
import { listSessions, ScanSessionRow } from "@/lib/scanSessions";
import ScanGate from "./ScanGate";

export default function ScanDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [sessions, setSessions] = useState<ScanSessionRow[]>([]);
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
  if (!user) return <ScanGate />;

  const select = (id: string) => setParams({ session: id }, { replace: false });
  const selected = sessions.find((s) => s.id === selectedId) || null;
  const completed = sessions.filter((s) => s.status === "completed");

  return (
    <ScanShell>
      <div style={{ display: "flex", height: "calc(100vh - 56px - 56px)" }}>
        <ScanSessionList sessions={sessions} selectedId={selectedId} onSelect={select} />

        <div style={{ flex: 1, overflow: "auto", background: "white" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>Loading…</div>
          ) : sessions.length === 0 ? (
            <EmptyHero onStart={() => navigate("/scan/new")} />
          ) : selected ? (
            selected.status === "in_progress" ? (
              <InProgressNotice onResume={() => navigate("/scan/new?resume=" + selected.id)} />
            ) : (
              <ScanResultsView session={selected} />
            )
          ) : completed.length === 0 ? (
            <EmptyHero onStart={() => navigate("/scan/new")} />
          ) : (
            <ScanOverview sessions={sessions} onSelect={select} />
          )}
        </div>
      </div>
    </ScanShell>
  );
}

function EmptyHero({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 60, fontFamily: "Inter, sans-serif" }}>
      <div style={{ fontWeight: 300, fontSize: 120, color: "rgba(0,71,171,0.08)", lineHeight: 1 }}>8</div>
      <div style={{ fontWeight: 300, fontSize: 28, color: "#0A1628", marginTop: 16 }}>Eight pillars.</div>
      <div style={{ fontWeight: 400, fontSize: 18, color: "#6B7280", marginTop: 6 }}>One binding constraint.</div>
      <button
        onClick={onStart}
        style={{
          marginTop: 28,
          background: "#0047AB",
          color: "white",
          padding: "12px 24px",
          borderRadius: 980,
          border: "none",
          fontWeight: 500,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Run your first Scan →
      </button>
    </div>
  );
}

function InProgressNotice({ onResume }: { onResume: () => void }) {
  return (
    <div style={{ padding: 48, fontFamily: "Inter, sans-serif" }}>
      <h2 style={{ fontWeight: 500, fontSize: 20, color: "#0A1628" }}>This scan is still in progress.</h2>
      <p style={{ color: "#6B7280", fontSize: 14, marginTop: 8 }}>Pick up where you left off — your scores are saved.</p>
      <button
        onClick={onResume}
        style={{
          marginTop: 16,
          background: "#0047AB",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          fontWeight: 500,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Resume scan →
      </button>
    </div>
  );
}
