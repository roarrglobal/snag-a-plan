import { Link } from "react-router-dom";

export default function ScanGate() {
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
      <div style={{ maxWidth: 640, padding: "120px 32px", width: "100%" }}>
        <span
          style={{
            display: "inline-block",
            background: "#0047AB",
            color: "white",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "4px 12px",
            borderRadius: 980,
            marginBottom: 32,
          }}
        >
          SCAN
        </span>
        <h1
          style={{
            fontWeight: 300,
            fontSize: 48,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#0A1628",
            margin: 0,
          }}
        >
          Find the break in your revenue system.
        </h1>
        <p
          style={{
            fontWeight: 400,
            fontSize: 18,
            color: "#6B7280",
            maxWidth: 480,
            marginTop: 24,
            lineHeight: 1.55,
          }}
        >
          Scan runs an eight-pillar diagnostic of your revenue structure. It identifies the single
          binding constraint costing you the most — with a financial impact estimate attached.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
          <Link
            to="/signup?module=scan"
            style={{
              background: "#0047AB",
              color: "white",
              fontWeight: 500,
              fontSize: 15,
              padding: "12px 24px",
              borderRadius: 980,
            }}
          >
            Create free account →
          </Link>
          <Link
            to="/login?redirect=/scan"
            style={{
              background: "transparent",
              color: "#0047AB",
              fontWeight: 500,
              fontSize: 15,
              padding: "12px 24px",
              borderRadius: 980,
              border: "1px solid rgba(0,71,171,0.3)",
            }}
          >
            Sign in
          </Link>
        </div>

        <p style={{ fontWeight: 400, fontSize: 14, color: "#6B7280", marginTop: 24 }}>
          No CRM connection required. Results saved to your account.
        </p>
      </div>
    </div>
  );
}
