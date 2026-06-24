interface Props {
  current: number; // 1..5
}

const STAGES = [
  { n: 1, name: "Identification" },
  { n: 2, name: "Inference" },
  { n: 3, name: "Inversion" },
  { n: 4, name: "Ideation" },
  { n: 5, name: "Integration" },
];

export function ZeroStepper({ current }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "20px 32px",
        borderBottom: "1px solid rgba(217,119,6,0.15)",
        background: "white",
      }}
    >
      {STAGES.map((s) => {
        const active = s.n === current;
        const done = s.n < current;
        return (
          <div
            key={s.n}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${active ? "rgba(217,119,6,0.8)" : "rgba(217,119,6,0.2)"}`,
              background: active ? "#FFFBEB" : done ? "white" : "white",
              opacity: done || active ? 1 : 0.55,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#D97706" }}>
              STAGE {s.n}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0A1628", marginTop: 2 }}>{s.name}</div>
          </div>
        );
      })}
    </div>
  );
}
