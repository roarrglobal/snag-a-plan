import { useNavigate } from "react-router-dom";

export function ZeroEmptyHero() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 60,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ fontWeight: 300, fontSize: 120, color: "rgba(217,119,6,0.08)", lineHeight: 1 }}>0</div>
      <div style={{ fontWeight: 300, fontSize: 24, color: "#0A1628", marginTop: 16, textAlign: "center" }}>
        Zero assumptions survive unexamined.
      </div>
      <button
        onClick={() => navigate("/zero/new")}
        style={{
          marginTop: 28,
          background: "#D97706",
          color: "white",
          padding: "12px 24px",
          borderRadius: 980,
          border: "none",
          fontWeight: 500,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Run your first examination →
      </button>
    </div>
  );
}
