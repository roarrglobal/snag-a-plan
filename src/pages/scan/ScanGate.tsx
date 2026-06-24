import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NerveShell } from "@/scan/NerveShell";

export default function ScanGate() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) return;
    localStorage.setItem("nerve_scan_email", email);
    sessionStorage.setItem("nerve_scan_guest", "true");
    navigate("/scan/inputs");
  };

  return (
    <NerveShell>
      <main className="max-w-xl mx-auto px-6 py-20">
        <h1 style={{ fontWeight: 600, fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          Run your Revenue Structure Diagnostic
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 16, fontSize: 16 }}>
          Eight pillars. One binding constraint. Twenty minutes.
        </p>
        <div style={{ height: 1, background: "rgba(0,71,171,0.2)", margin: "32px 0" }} />
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md outline-none"
            style={{
              background: "transparent",
              border: "1px solid rgba(0,71,171,0.6)",
              color: "white",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-md transition-opacity hover:opacity-90"
            style={{ background: "#0047AB", color: "white", fontWeight: 500, fontSize: 16 }}
          >
            Start Diagnostic →
          </button>
        </form>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0047AB" }}>Sign in →</Link>
        </p>
      </main>
    </NerveShell>
  );
}
