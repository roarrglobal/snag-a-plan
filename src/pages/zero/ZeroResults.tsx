import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ZeroShell } from "@/zero/ZeroShell";
import { getSession, verdictColor, verdictLabel, ZeroSessionRow } from "@/lib/zeroSessions";

export default function ZeroResults() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<ZeroSessionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getSession(id).then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, [id]);

  if (isLoading || loading) return <ZeroShell><div style={{ padding: 60, textAlign: "center", color: "#9CA3AF" }}>Loading…</div></ZeroShell>;
  if (!user || !session) return <ZeroShell><div style={{ padding: 60, textAlign: "center" }}>Not found.</div></ZeroShell>;

  const beliefs = session.stage1_register || [];
  const inversion = session.stage3_inversion || [];
  const surviving = inversion.filter((i) => i.verdict === "survive" || i.verdict === "survive_modified").length;
  const failed = inversion.filter((i) => i.verdict === "fail").length;
  const verdict = session.overall_verdict;
  const colors = verdictColor(verdict);
  const proceed = verdict === "proceed" || verdict === "proceed_modified";

  return (
    <ZeroShell>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ padding: 24, borderRadius: 14, border: "1px solid rgba(217,119,6,0.2)", background: "white" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#78350F", letterSpacing: "0.08em" }}>EXAMINATION COMPLETE</div>
          <h1 style={{ fontWeight: 300, fontSize: 28, lineHeight: 1.3, color: "#0A1628", marginTop: 10 }}>
            {session.decision_text}
          </h1>
          <div style={{ marginTop: 18, display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Stat label="Beliefs examined" value={beliefs.length} />
            <Stat label="Surviving" value={surviving} color="#166534" />
            <Stat label="Failed" value={failed} color="#991B1B" />
          </div>
          <div style={{ marginTop: 20 }}>
            <span style={{ background: colors.bg, color: colors.fg, padding: "8px 16px", borderRadius: 980, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
              VERDICT: {verdictLabel(verdict)}
            </span>
          </div>
        </div>

        <NextSteps proceed={proceed} verdict={verdict} sessionId={session.id} navigate={navigate} />

        {session.stage4_matrix && (
          <Collapsible title="Stage 4 — Traceability Matrix">
            <div style={{ fontSize: 13, color: "#374151" }}>{session.stage4_matrix.conclusion_summary}</div>
            <ul style={{ marginTop: 10, fontSize: 13, color: "#0A1628" }}>
              {session.stage4_matrix.elements.map((e, i) => (
                <li key={i} style={{ marginTop: 6 }}>
                  <strong>{e.element}</strong> — {e.supporting_irreducibles.join("; ")}
                </li>
              ))}
            </ul>
          </Collapsible>
        )}

        {session.stage5_protocol && (
          <Collapsible title="Stage 5 — Integration Protocol">
            <div style={{ fontSize: 13, color: "#0A1628" }}>
              <div><strong>Accountability:</strong> {session.stage5_protocol.accountability}</div>
              <div style={{ marginTop: 10 }}><strong>Measurement points:</strong></div>
              <ul>{session.stage5_protocol.measurement_points.map((m, i) => <li key={i}>{m.metric} — {m.frequency} — {m.target}</li>)}</ul>
              <div style={{ marginTop: 10 }}><strong>Tolerance bands:</strong></div>
              <ul>{session.stage5_protocol.tolerance_bands.map((b, i) => <li key={i}>{b.metric}: {b.acceptable_range} (breach: {b.breach_condition})</li>)}</ul>
              <div style={{ marginTop: 10 }}><strong>Escalation triggers:</strong></div>
              <ul>{session.stage5_protocol.escalation_triggers.map((t, i) => <li key={i}>{t.condition} → re-enter {t.re_entry_stage}: {t.action}</li>)}</ul>
            </div>
          </Collapsible>
        )}

        {beliefs.length > 0 && (
          <Collapsible title={`Stage 1 — Inheritance Register (${beliefs.length} beliefs)`}>
            <ul style={{ fontSize: 13, color: "#0A1628" }}>
              {beliefs.map((b) => (
                <li key={b.id} style={{ marginTop: 6 }}>
                  {b.belief} <span style={{ color: "#6B7280" }}>— source: {b.named_source || "—"} ({b.date_established || "—"})</span>
                </li>
              ))}
            </ul>
          </Collapsible>
        )}
      </div>
    </ZeroShell>
  );
}

function Stat({ label, value, color = "#0A1628" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 400, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function NextSteps({ proceed, verdict, sessionId, navigate }: { proceed: boolean; verdict: any; sessionId: string; navigate: (p: string) => void }) {
  if (proceed) {
    return (
      <div style={{ marginTop: 24, padding: 20, borderRadius: 12, border: "1px solid rgba(217,119,6,0.25)", background: "#FFFBEB" }}>
        <div style={{ fontWeight: 600, color: "#78350F", fontSize: 14 }}>Gate the commitment</div>
        <div style={{ fontSize: 13, color: "#78350F", marginTop: 6, lineHeight: 1.5 }}>
          Run SNAG before committing resources.
        </div>
        <button onClick={() => navigate(`/analyze?zero_session_id=${sessionId}`)} style={cta}>Open SNAG →</button>
      </div>
    );
  }
  if (verdict === "do_not_proceed") {
    return (
      <div style={{ marginTop: 24, padding: 20, borderRadius: 12, border: "1px solid rgba(190,52,85,0.2)", background: "#FFF1F2" }}>
        <div style={{ fontWeight: 600, color: "#881337", fontSize: 14 }}>The examination found a failing belief</div>
        <div style={{ fontSize: 13, color: "#881337", marginTop: 6, lineHeight: 1.5 }}>
          Do not proceed on the original plan. The conclusion built on this belief will reproduce the same outcome.
        </div>
        <button onClick={() => navigate("/zero/new")} style={cta}>Start new examination →</button>
      </div>
    );
  }
  return null;
}

const cta: React.CSSProperties = {
  marginTop: 14,
  background: "#D97706",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: 980,
  fontWeight: 500,
  fontSize: 13,
  cursor: "pointer",
};

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16, border: "1px solid #E5E7EB", borderRadius: 10, background: "white" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "14px 18px",
          fontSize: 13,
          fontWeight: 600,
          color: "#0A1628",
          cursor: "pointer",
        }}
      >
        {open ? "▼" : "▶"} {title}
      </button>
      {open && <div style={{ padding: "0 18px 18px" }}>{children}</div>}
    </div>
  );
}


