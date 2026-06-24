import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScanShell } from "@/scan/ScanShell";
import { listSessions, ScanSessionRow } from "@/lib/scanSessions";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ScanReports() {
  const { user, isLoading } = useAuth();
  const [sessions, setSessions] = useState<ScanSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listSessions().then((s) => {
      setSessions(s.filter((x) => x.status === "completed").reverse());
      setLoading(false);
    });
  }, [user]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login?redirect=/scan/reports" replace />;

  return (
    <ScanShell>
      <div style={{ padding: 32, fontFamily: "Inter, sans-serif", color: "#0A1628" }}>
        <h1 style={{ fontWeight: 300, fontSize: 28, margin: 0 }}>Scan Reports</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 6 }}>Trends across your completed scans.</p>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF" }}>Loading…</div>
        ) : sessions.length < 2 ? (
          <div style={{ marginTop: 48, padding: 48, background: "#EFF6FF", border: "1px solid rgba(0,71,171,0.2)", borderRadius: 16, textAlign: "center", color: "#1E3A5F", fontSize: 15 }}>
            Run at least two scans to see trends.
          </div>
        ) : (
          <Reports sessions={sessions} />
        )}
      </div>
    </ScanShell>
  );
}

function Reports({ sessions }: { sessions: ScanSessionRow[] }) {
  // Constraint frequency
  const freqMap: Record<string, number> = {};
  for (const s of sessions) {
    const name = s.binding_constraint?.pillar_name;
    if (name) freqMap[name] = (freqMap[name] || 0) + 1;
  }
  const freqData = Object.entries(freqMap).map(([name, count]) => ({ name, count }));

  // Score trend
  const scoreData = sessions.map((s, i) => ({
    label: new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: s.binding_constraint?.score ?? 0,
  }));

  // Financial impact trend
  const impactData = sessions.map((s) => ({
    label: new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    impact: Math.round((s.financial_impact?.total_impact ?? 0) / 1000),
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginTop: 32 }}>
      <Panel title="Constraint frequency" subtitle="Which pillars have been binding most often.">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={freqData}>
            <CartesianGrid stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} interval={0} angle={-15} height={70} textAnchor="end" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0047AB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Binding constraint score over time" subtitle="Lower scores mean a worse-performing pillar.">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={scoreData}>
            <CartesianGrid stroke="#F3F4F6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis domain={[0, 25]} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#0047AB" strokeWidth={2} dot={{ fill: "#0047AB" }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Estimated financial impact (in $K)" subtitle="Total annual upside if the binding constraint were resolved.">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={impactData}>
            <CartesianGrid stroke="#F3F4F6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip />
            <Line type="monotone" dataKey="impact" stroke="#0047AB" strokeWidth={2} dot={{ fill: "#0047AB" }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24 }}>
      <h3 style={{ fontWeight: 600, fontSize: 16, color: "#0A1628", margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{subtitle}</p>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
}
