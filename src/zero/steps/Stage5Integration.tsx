import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Stage5Protocol, updateSession, ZeroSessionRow, computeOverallVerdict } from "@/lib/zeroSessions";
import { StageHeader, ContinueBar } from "./Stage1Identification";
import { AlertTriangle } from "lucide-react";

export function Stage5Integration({ session, onComplete }: {
  session: ZeroSessionRow;
  onComplete: (id: string) => void;
}) {
  const [protocol, setProtocol] = useState<Stage5Protocol | null>(session.stage5_protocol || null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setError(null);
    setGenerating(true);
    const { data, error: err } = await supabase.functions.invoke("zero-stage5-integration", {
      body: {
        decision: session.decision_text,
        conclusion: session.stage4_matrix?.conclusion_summary || "",
        elements: (session.stage4_matrix?.elements || []).filter((e) => e.status === "grounded"),
      },
    });
    setGenerating(false);
    if (err || !data?.measurement_points) {
      setError(data?.error || err?.message || "Generation failed");
      return;
    }
    setProtocol({
      measurement_points: data.measurement_points || [],
      tolerance_bands: data.tolerance_bands || [],
      escalation_triggers: data.escalation_triggers || [],
      accountability: data.accountability || "",
      signed_off: protocol?.signed_off ?? false,
    });
  };

  const canComplete = !!protocol && protocol.signed_off;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 32px 80px" }}>
      <StageHeader stage={5} name="Integration" subtitle="The Integration Protocol" />

      <div
        style={{
          background: "#FFFBEB",
          border: "1px solid rgba(217,119,6,0.2)",
          borderRadius: 12,
          padding: 20,
          color: "#78350F",
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        Deploy the decision with measurement points, tolerance bands, and escalation triggers. State the bands before
        deployment. The commitment is what makes the protocol meaningful.
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={generate}
          disabled={generating}
          style={{
            background: "#D97706",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: 980,
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {generating ? "Drafting protocol…" : protocol ? "Redraft Integration Protocol" : "Draft Integration Protocol"}
        </button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, fontSize: 13 }}>{error}</div>}

      {protocol && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          <Section title="Measurement Points">
            {protocol.measurement_points.map((m, i) => (
              <div key={i} style={amberLeftCard}>
                <div style={cardLabel}>{m.metric}</div>
                <div style={cardMeta}>Frequency: {m.frequency}</div>
                <div style={cardMeta}>Target: {m.target}</div>
              </div>
            ))}
          </Section>

          <Section title="Tolerance Bands">
            {protocol.tolerance_bands.map((b, i) => (
              <div key={i} style={amberLeftCard}>
                <div style={cardLabel}>{b.metric}</div>
                <div style={cardMeta}>Acceptable: {b.acceptable_range}</div>
                <div style={{ ...cardMeta, color: "#991B1B", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={12} /> Breach: {b.breach_condition}
                </div>
              </div>
            ))}
          </Section>

          <Section title="Escalation Triggers">
            {protocol.escalation_triggers.map((t, i) => (
              <div key={i} style={amberLeftCard}>
                <div style={cardLabel}>{t.condition}</div>
                <div style={cardMeta}>Re-entry: <strong>{t.re_entry_stage}</strong></div>
                <div style={cardMeta}>Action: {t.action}</div>
              </div>
            ))}
          </Section>

          <div>
            <label style={fieldLabel}>Who will hold you accountable to these bands?</label>
            <textarea
              value={protocol.accountability}
              onChange={(e) => setProtocol({ ...protocol, accountability: e.target.value })}
              placeholder="Name, role, and review cadence."
              style={{
                width: "100%",
                marginTop: 6,
                minHeight: 70,
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: 12,
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                color: "#0A1628",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={protocol.signed_off}
              onChange={(e) => setProtocol({ ...protocol, signed_off: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <span style={{ fontSize: 14, color: "#0A1628", lineHeight: 1.5 }}>
              I have reviewed these bands, set them before deployment, and will not adjust them retrospectively.
            </span>
          </label>
        </div>
      )}

      <ContinueBar
        canContinue={canComplete}
        disabledReason="Draft the protocol and sign off to complete the examination."
        onClick={async () => {
          if (!protocol) return;
          const verdict = computeOverallVerdict(session.stage3_inversion || []);
          await updateSession(session.id, {
            stage5_protocol: protocol,
            overall_verdict: verdict,
            status: "completed",
          });
          onComplete(session.id);
        }}
        label="Complete examination →"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#78350F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>{children}</div>
    </div>
  );
}

const amberLeftCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #E5E7EB",
  borderLeft: "3px solid #D97706",
  borderRadius: 8,
  padding: 14,
};

const cardLabel: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "#0A1628", lineHeight: 1.4 };
const cardMeta: React.CSSProperties = { fontSize: 12, color: "#6B7280", marginTop: 6, lineHeight: 1.4 };
const fieldLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#78350F", letterSpacing: "0.06em", textTransform: "uppercase" };
