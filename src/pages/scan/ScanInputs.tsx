import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NerveShell } from "@/scan/NerveShell";

interface FieldDef {
  key: string;
  label: string;
  suffix?: string;
  placeholder: string;
  helper?: string;
  min?: number;
  max?: number;
  integer?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: "arr", label: "Annual Recurring Revenue", suffix: "₹ or $", placeholder: "e.g. 50000000", helper: "Your current annualised contracted revenue" },
  { key: "avgDeal", label: "Average Deal Size", suffix: "₹ or $", placeholder: "e.g. 500000" },
  { key: "winRate", label: "Win Rate", suffix: "%", placeholder: "e.g. 22", min: 0, max: 100, helper: "Percentage of qualified opportunities that close" },
  { key: "forecastAcc", label: "Forecast Accuracy", suffix: "%", placeholder: "e.g. 61", min: 0, max: 100, helper: "Actual vs. called at quarter close, last four quarters average" },
  { key: "pipelineCov", label: "Pipeline Coverage Ratio", suffix: "x", placeholder: "e.g. 3.2", helper: "Pipeline value divided by revenue target" },
  { key: "numAEs", label: "Number of Account Executives", placeholder: "e.g. 8", integer: true },
  { key: "nrr", label: "Net Revenue Retention", suffix: "%", placeholder: "e.g. 98", helper: "Revenue retained plus expansion from existing customers" },
];

export default function ScanInputs() {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});

  const allFilled = FIELDS.every((f) => values[f.key] && values[f.key].trim() !== "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled) return;
    const parsed: Record<string, number> = {};
    for (const f of FIELDS) parsed[f.key] = Number(values[f.key]);
    localStorage.setItem("nerve_scan_company_inputs", JSON.stringify(parsed));
    navigate("/scan/diagnostic");
  };

  return (
    <NerveShell>
      <main className="max-w-2xl mx-auto px-6 py-16" style={{ maxWidth: 640 }}>
        <h1 style={{ fontWeight: 600, fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          Find the break in your revenue system.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 12, fontSize: 15 }}>
          Eight pillars. Twenty minutes. One binding constraint.
        </p>
        <div style={{ height: 1, background: "rgba(0,71,171,0.2)", margin: "28px 0" }} />

        <form onSubmit={submit} className="space-y-6">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                {f.label}
                {f.suffix && (
                  <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 8, fontWeight: 400 }}>
                    ({f.suffix})
                  </span>
                )}
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
                className="w-full px-3 py-2 rounded-md outline-none"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,71,171,0.6)",
                  color: "white",
                  fontSize: 15,
                }}
              />
              {f.helper && (
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 6 }}>
                  {f.helper}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={!allFilled}
            className="w-full py-3 rounded-md transition-opacity"
            style={{
              background: "#0047AB",
              color: "white",
              fontWeight: 500,
              fontSize: 16,
              opacity: allFilled ? 1 : 0.4,
              cursor: allFilled ? "pointer" : "not-allowed",
            }}
          >
            Begin Diagnostic →
          </button>
        </form>
      </main>
    </NerveShell>
  );
}
