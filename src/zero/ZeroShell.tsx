import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppTopNav } from "@/components/layout/AppTopNav";

interface Props {
  children: ReactNode;
  hideNewButton?: boolean;
}

export function ZeroShell({ children, hideNewButton }: Props) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFFFFF" }}>
      <AppTopNav onMenuClick={() => {}} sidebarOpen={false} />
      <div
        style={{
          height: 56,
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(217,119,6,0.15)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/zero" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              background: "#D97706",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.08em",
              padding: "4px 12px",
              borderRadius: 980,
            }}
          >
            ZERO
          </span>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 13, color: "#78350F" }}>
            Belief examination
          </span>
        </Link>
        {!hideNewButton && (
          <Link
            to="/zero/new"
            style={{
              background: "#D97706",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 13,
              padding: "8px 16px",
              borderRadius: 980,
            }}
          >
            + New examination
          </Link>
        )}
      </div>
      <main className="flex-1" style={{ fontFamily: "Inter, sans-serif", color: "#0A1628" }}>
        {children}
      </main>
    </div>
  );
}
