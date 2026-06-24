import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppTopNav } from "@/components/layout/AppTopNav";

interface ScanShellProps {
  children: ReactNode;
  hideNewButton?: boolean;
}

export function ScanShell({ children, hideNewButton }: ScanShellProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFFFFF" }}>
      <AppTopNav onMenuClick={() => {}} sidebarOpen={false} />

      {/* Module sub-header */}
      <div
        style={{
          height: 56,
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(0,71,171,0.15)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/scan" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              background: "#0047AB",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.08em",
              padding: "4px 12px",
              borderRadius: 980,
            }}
          >
            SCAN
          </span>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 13, color: "#1E3A5F" }}>
            Revenue Structure Diagnostic
          </span>
        </Link>
        {!hideNewButton && (
          <Link
            to="/scan/new"
            style={{
              background: "#0047AB",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 13,
              padding: "8px 16px",
              borderRadius: 980,
            }}
          >
            + New Scan
          </Link>
        )}
      </div>

      <main className="flex-1" style={{ fontFamily: "Inter, sans-serif", color: "#0A1628" }}>
        {children}
      </main>
    </div>
  );
}
