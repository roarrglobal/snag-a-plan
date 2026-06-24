import { Link } from "react-router-dom";

export default function ZeroGate() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        color: "#0A1628",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 720, padding: "120px 32px", width: "100%" }}>
        <span
          style={{
            display: "inline-block",
            background: "#D97706",
            color: "white",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "4px 12px",
            borderRadius: 980,
            marginBottom: 32,
          }}
        >
          ZERO
        </span>
        <h1 style={{ fontWeight: 300, fontSize: 48, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#0A1628", margin: 0 }}>
          Examine the belief driving your problem.
        </h1>
        <p style={{ fontWeight: 400, fontSize: 18, color: "#6B7280", maxWidth: 560, marginTop: 24, lineHeight: 1.55 }}>
          ZERO applies five-stage first-principles reasoning to surface the load-bearing belief behind your revenue
          problem, test whether it holds under adversarial examination, and build a decision forward from what survives.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
          <Link
            to="/signup?module=zero"
            style={{ background: "#D97706", color: "white", fontWeight: 500, fontSize: 15, padding: "12px 24px", borderRadius: 980 }}
          >
            Create free account →
          </Link>
          <Link
            to="/login?redirect=/zero"
            style={{
              background: "transparent",
              color: "#D97706",
              fontWeight: 500,
              fontSize: 15,
              padding: "12px 24px",
              borderRadius: 980,
              border: "1px solid rgba(217,119,6,0.3)",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
