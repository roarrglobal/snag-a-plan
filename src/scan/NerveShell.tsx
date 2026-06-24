import { ReactNode } from "react";
import { Link } from "react-router-dom";

export function NerveShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#0A1628",
        color: "#FFFFFF",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header className="border-b" style={{ borderColor: "rgba(0,71,171,0.3)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/scan" className="flex items-baseline gap-3">
            <span style={{ fontWeight: 300, fontSize: 28, letterSpacing: "-0.02em" }}>nerve</span>
            <span style={{ color: "#0047AB", fontWeight: 500, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Scan
            </span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            Revenue Structure Diagnostic
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
