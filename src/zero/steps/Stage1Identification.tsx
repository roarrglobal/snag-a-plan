import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Belief, ValidityFlag, updateSession, ZeroSessionRow } from "@/lib/zeroSessions";
import { X } from "lucide-react";

const VALIDITIES: { id: ValidityFlag; label: string; color: string }[] = [
  { id: "likely_current", label: "Likely current", color: "#16A34A" },
  { id: "requires_examination", label: "Requires examination", color: "#D97706" },
  { id: "likely_outdated", label: "Likely outdated", color: "#BE3455" },
];

function newBelief(): Belief {
  return {
    id: crypto.randomUUID(),
    belief: "",
    load_bearing: true,
    named_source: "",
    date_established: "",
    validity_flag: "requires_examination",
  };
}

export function Stage1Identification({ session, onSaved, onContinue }: {
  session: ZeroSessionRow;
  onSaved: (next: ZeroSessionRow) => void;
  onContinue: () => void;
}) {
  const [beliefs, setBeliefs] = useState<Belief[]>(session.stage1_register || []);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setError(null);
    setGenerating(true);
    const { data, error: err } = await supabase.functions.invoke("zero-stage1-generate", {
      body: { decision: session.decision_text, context: session.context_text },
    });
    setGenerating(false);
    if (err || !data?.beliefs) {
      setError(data?.error || err?.message || "Generation failed");
      return;
    }
    const generated: Belief[] = data.beliefs.map((b: any) => ({
      id: crypto.randomUUID(),
      belief: b.belief || "",
      load_bearing: true,
      named_source: b.suggested_source || "",
      date_established: b.suggested_date || "",
      validity_flag: (["likely_current", "requires_examination", "likely_outdated"].includes(b.validity_flag?.toLowerCase().replace(/\s+/g, "_"))
        ? b.validity_flag.toLowerCase().replace(/\s+/g, "_")
        : "requires_examination") as ValidityFlag,
    }));
    setBeliefs((prev) => [...prev, ...generated]);
  };

  const update = (id: string, patch: Partial<Belief>) =>
    setBeliefs((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id: string) => setBeliefs((bs) => bs.filter((b) => b.id !== id));

  const loadBearing = beliefs.filter((b) => b.load_bearing);
  const allSourced = loadBearing.every((b) => b.named_source.trim().length > 0 && b.belief.trim().length > 0);
  const canContinue = loadBearing.length >= 3 && allSourced;

  const save = async () => {
    await updateSession(session.id, { stage1_register: beliefs, status: "stage1_complete" });
    onSaved({ ...session, stage1_register: beliefs, status: "stage1_complete" });
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 32px 80px" }}>
      <StageHeader stage={1} name="Identification" subtitle="The Inheritance Register" />

      <div style={instructionCard}>
        Surface every belief your team is holding that this decision depends on. For each belief, identify: who
        established it, when, and under what conditions. A belief without a named source has never been examined.
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <button onClick={generate} disabled={generating} style={secondaryAmber}>
          {generating ? "Generating candidate beliefs…" : "Generate candidate beliefs"}
        </button>
        <button onClick={() => setBeliefs((bs) => [...bs, newBelief()])} style={linkAmber}>
          + Add belief manually
        </button>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {beliefs.map((b) => (
          <div
            key={b.id}
            style={{
              ...card,
              opacity: b.load_bearing ? 1 : 0.5,
              position: "relative",
            }}
          >
            <button
              onClick={() => remove(b.id)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#9CA3AF",
              }}
            >
              <X size={16} />
            </button>

            <textarea
              value={b.belief}
              onChange={(e) => update(b.id, { belief: e.target.value })}
              placeholder="State the belief as a clear declarative sentence."
              style={beliefTextarea}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
              <Field label="Load-bearing?">
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    ["Yes", true],
                    ["No", false],
                  ].map(([label, val]) => {
                    const active = b.load_bearing === val;
                    return (
                      <button
                        key={String(val)}
                        onClick={() => update(b.id, { load_bearing: val as boolean })}
                        style={{
                          ...pillBtn,
                          background: active ? "#D97706" : "white",
                          color: active ? "white" : "#6B7280",
                          borderColor: active ? "#D97706" : "#E5E7EB",
                        }}
                      >
                        {label as string}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Named source">
                <input
                  value={b.named_source}
                  onChange={(e) => update(b.id, { named_source: e.target.value })}
                  placeholder="Specific person, document, or event"
                  style={textInput}
                />
              </Field>

              <Field label="Established">
                <input
                  value={b.date_established}
                  onChange={(e) => update(b.id, { date_established: e.target.value })}
                  placeholder="e.g. Q3 2022"
                  style={textInput}
                />
              </Field>
            </div>

            <Field label="Current validity" style={{ marginTop: 14 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {VALIDITIES.map((v) => {
                  const active = b.validity_flag === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => update(b.id, { validity_flag: v.id })}
                      style={{
                        ...pillBtn,
                        background: active ? v.color : "white",
                        color: active ? "white" : "#6B7280",
                        borderColor: active ? v.color : "#E5E7EB",
                      }}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        ))}
      </div>

      <ContinueBar
        canContinue={canContinue}
        disabledReason="Every load-bearing belief must have a named source before proceeding."
        onClick={async () => {
          await save();
          onContinue();
        }}
        label="Continue to Stage 2 →"
      />
    </div>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#78350F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

export function StageHeader({ stage, name, subtitle }: { stage: number; name: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <span
        style={{
          background: "#D97706",
          color: "white",
          padding: "4px 12px",
          borderRadius: 980,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        STAGE {stage}
      </span>
      <div style={{ fontWeight: 500, fontSize: 22, color: "#0A1628", marginTop: 12 }}>{name}</div>
      <div style={{ fontWeight: 400, fontSize: 14, color: "#78350F", marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

export function ContinueBar({
  canContinue,
  onClick,
  disabledReason,
  label,
}: {
  canContinue: boolean;
  onClick: () => void;
  disabledReason: string;
  label: string;
}) {
  return (
    <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 12 }}>
      <button
        disabled={!canContinue}
        onClick={onClick}
        title={canContinue ? undefined : disabledReason}
        style={{
          background: canContinue ? "#D97706" : "#E5E7EB",
          color: canContinue ? "white" : "#9CA3AF",
          padding: "12px 24px",
          borderRadius: 980,
          border: "none",
          fontWeight: 500,
          fontSize: 14,
          cursor: canContinue ? "pointer" : "not-allowed",
        }}
      >
        {label}
      </button>
      {!canContinue && <span style={{ fontSize: 12, color: "#9CA3AF" }}>{disabledReason}</span>}
    </div>
  );
}

const instructionCard: React.CSSProperties = {
  background: "#FFFBEB",
  border: "1px solid rgba(217,119,6,0.2)",
  borderRadius: 12,
  padding: 20,
  color: "#78350F",
  fontSize: 15,
  lineHeight: 1.55,
};

const secondaryAmber: React.CSSProperties = {
  background: "white",
  border: "1px solid #D97706",
  color: "#D97706",
  fontWeight: 500,
  fontSize: 13,
  padding: "10px 18px",
  borderRadius: 980,
  cursor: "pointer",
};

const linkAmber: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#D97706",
  fontWeight: 500,
  fontSize: 13,
  cursor: "pointer",
  padding: "10px 0",
};

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 20,
};

const beliefTextarea: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: 12,
  fontFamily: "Inter, sans-serif",
  fontSize: 15,
  color: "#0A1628",
  minHeight: 56,
  resize: "vertical",
  outline: "none",
};

const textInput: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: "9px 10px",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  color: "#0A1628",
  outline: "none",
};

const pillBtn: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 980,
  border: "1px solid #E5E7EB",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: "#FEE2E2",
  color: "#991B1B",
  borderRadius: 8,
  fontSize: 13,
};
