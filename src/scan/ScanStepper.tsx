interface Props {
  step: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: "Company inputs" },
  { n: 2, label: "Eight pillars" },
  { n: 3, label: "Results" },
];

export function ScanStepper({ step }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 32px", fontFamily: "Inter, sans-serif" }}>
      {STEPS.map((s, i) => {
        const active = s.n === step;
        const done = s.n < step;
        const color = active ? "#0047AB" : done ? "#0047AB" : "#9CA3AF";
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: active || done ? "#0047AB" : "transparent",
                  border: active || done ? "none" : "1px solid #D1D5DB",
                  color: active || done ? "white" : "#9CA3AF",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {done ? "✓" : s.n}
              </span>
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span style={{ width: 32, height: 1, background: "#E5E7EB" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
