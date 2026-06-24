import { useState } from "react";
import { createInProgressSession } from "@/lib/scanSessions";
import type { CompanyInputs } from "@/scan/calc";

interface FieldDef {
  key: keyof CompanyInputs;
  label: string;
  suffix?: string;
  placeholder: string;
  helper?: string;
  min?: number;
  max?: number;
  integer?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: "arr", label: "Annual Recurring Revenue", suffix: "$", placeholder: "e.g. 50000000", helper: "Your current annualised contracted revenue" },
  { key: "avgDeal", label: "Average Deal Size", suffix: "$", placeholder: "e.g. 500000" },
  { key: "winRate", label: "Win Rate", suffix: "%", placeholder: "e.g. 22", min: 0, max: 100 },
  { key: "forecastAcc", label: "Forecast Accuracy", suffix: "%", placeholder: "e.g. 61", min: 0, max: 100 },
  { key: "pipelineCov", label: "Pipeline Coverage Ratio", suffix: "x", placeholder: "e.g. 3.2" },
  { key: "numAEs", label: "Number of Account Executives", placeholder: "e.g. 8", integer: true },
  { key: "nrr", label: "Net Revenue Retention", suffix: "%", placeholder: "e.g. 98" },
];

interface Props {
  onComplete: (sessionId: string, inputs: CompanyInputs) => void;
  initial?: CompanyInputs | null;
}

export function InputsStep({ onComplete, initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    if (initial) {
      for (const f of FIELDS) v[f.key] = String((initial as any)[f.key] ?? "");
    }
    return v;
  });
  const [saving, setSaving] = useState(false);

  const allFilled = FIELDS.every((f) => values[f.key] && values[f.key].trim() !== "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled || saving) return;
    setSaving(true);
    const parsed: CompanyInputs = {} as any;
    for (const f of FIELDS) (parsed as any)[f.key] = Number(values[f.key]);
    const id = await createInProgressSession(parsed);
    setSaving(false);
    if (id) {
      localStorage.setItem("nerve_scan_company_inputs", JSON.stringify(parsed));
      onComplete(id, parsed);
    }
  };

  return (
    <div style={{ padding: "0 32px 48px", display: "flex", justifyContent: "center" }}>
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 640,
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 40,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h2 style={{ fontWeight: 500, fontSize: 18, color: "#0A1628", margin: 0 }}>Session details</h2>
        <p style={{ fontWeight: 400, fontSize: 14, color: "#6B7280", marginTop: 6 }}>
          These inputs drive the financial impact calculation.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 28 }}>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1E3A5F", marginBottom: 6 }}>
                {f.label}
                {f.suffix && <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 6 }}>({f.suffix})</span>}
              </label>
              <input
                type="number"
                step={f.integer ? 1 : "any"}
                min={f.min}
                max={f.max}
                placeholder={f.placeholder}
                value={values[f.key] || ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(0,71,171,0.2)",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  color: "#0A1628",
                  background: "white",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,71,171,0.8)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,71,171,0.2)")}
              />
              {f.helper && (
                <p style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>{f.helper}</p>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={!allFilled || saving}
          style={{
            marginTop: 28,
            width: "100%",
            padding: "12px 24px",
            background: "#0047AB",
            color: "white",
            fontWeight: 500,
            fontSize: 15,
            borderRadius: 8,
            border: "none",
            cursor: allFilled && !saving ? "pointer" : "not-allowed",
            opacity: allFilled && !saving ? 1 : 0.5,
          }}
        >
          {saving ? "Saving…" : "Begin Diagnostic →"}
        </button>
      </form>
    </div>
  );
}
