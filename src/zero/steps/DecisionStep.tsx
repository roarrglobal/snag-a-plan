import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createSession } from "@/lib/zeroSessions";

interface ScanPrefill {
  pillarName: string;
  score: number;
  decision: string;
  context: string;
}

export function DecisionStep({ onCreated }: { onCreated: (id: string) => void }) {
  const [params] = useSearchParams();
  const scanId = params.get("scan_session_id");
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [prefill, setPrefill] = useState<ScanPrefill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    (async () => {
      const { data } = await supabase.from("scan_sessions").select("binding_constraint").eq("id", scanId).maybeSingle();
      const bc: any = data?.binding_constraint;
      if (!bc?.pillar_name) return;
      const dec = `Our Scan diagnostic identified ${bc.pillar_name} as the binding constraint (scored ${bc.score}/25). We are examining the belief driving this constraint.`;
      const ctx = Array.isArray(bc.evidence) ? bc.evidence.join("\n") : "";
      setPrefill({ pillarName: bc.pillar_name, score: bc.score, decision: dec, context: ctx });
      setDecision(dec);
      setContext(ctx);
    })();
  }, [scanId]);

  const begin = async () => {
    if (decision.trim().length < 20) return;
    setSubmitting(true);
    const id = await createSession(decision.trim(), context.trim(), scanId);
    setSubmitting(false);
    if (id) onCreated(id);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 32px" }}>
      <span style={pill}>ZERO</span>

      {prefill && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            border: "1px solid rgba(0,71,171,0.2)",
            background: "#EFF6FF",
            borderRadius: 8,
            fontSize: 13,
            color: "#1E3A5F",
          }}
        >
          Examining constraint from your Scan: <strong>{prefill.pillarName}</strong> scored {prefill.score}/25
        </div>
      )}

      <h2 style={{ fontWeight: 500, fontSize: 22, color: "#0A1628", marginTop: 24 }}>
        What decision is your team examining?
      </h2>

      <textarea
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        placeholder="Describe the decision, commitment, or strategic direction your team is about to make. Include what is at stake and what outcome you are expecting. Be specific."
        style={{
          ...inputStyle,
          minHeight: 160,
          marginTop: 16,
        }}
      />

      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0A1628", marginTop: 24 }}>
        Additional context <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
      </label>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Industry, company size, market conditions, recent relevant events."
        style={{ ...inputStyle, minHeight: 90, marginTop: 8 }}
      />

      <button
        disabled={decision.trim().length < 20 || submitting}
        onClick={begin}
        style={{
          marginTop: 28,
          background: decision.trim().length < 20 ? "#E5E7EB" : "#D97706",
          color: decision.trim().length < 20 ? "#9CA3AF" : "white",
          fontWeight: 500,
          fontSize: 14,
          padding: "12px 24px",
          borderRadius: 980,
          border: "none",
          cursor: decision.trim().length < 20 ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Saving…" : "Begin Stage 1 →"}
      </button>
    </div>
  );
}

const pill: React.CSSProperties = {
  display: "inline-block",
  background: "#D97706",
  color: "white",
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: "0.08em",
  padding: "4px 12px",
  borderRadius: 980,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(217,119,6,0.3)",
  borderRadius: 12,
  padding: 20,
  fontFamily: "Inter, sans-serif",
  fontSize: 15,
  color: "#0A1628",
  resize: "vertical",
  outline: "none",
};
