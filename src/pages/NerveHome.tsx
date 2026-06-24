import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Unlink,
  HelpCircle,
  Shield,
  Activity,
  Radar,
  CircleDot,
  GitBranch,
  Menu,
  X,
} from "lucide-react";

const NAVY = "#0A1628";
const COBALT = "#0047AB";
const CRIMSON = "#BE3455";
const SUBTLE = "rgba(255,255,255,0.6)";
const BORDER = "rgba(0,71,171,0.2)";
const CARD = "rgba(255,255,255,0.03)";

export default function NerveHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        backgroundColor: NAVY,
        color: "#FFFFFF",
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: NAVY,
          borderBottom: `1px solid ${BORDER}`,
          zIndex: 50,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2">
            <span style={{ fontWeight: 300, fontSize: 24, letterSpacing: "-0.02em" }}>nerve</span>
            <span style={{ color: SUBTLE, fontSize: 11 }}>·</span>
            <span style={{ color: SUBTLE, fontSize: 11 }}>by Mahesh Iyer</span>
          </Link>
          <div className="hidden md:flex items-center gap-7" style={{ fontSize: 14 }}>
            <NavItem label="Pulse" disabled />
            <NavItem label="Scan" to="/scan" />
            <NavItem label="ZERO" disabled />
            <NavItem label="SNAG" to="/analyze" />
          </div>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" style={{ color: SUBTLE, fontSize: 14 }}>Dashboard →</Link>
            ) : (
              <>
                <Link to="/login" style={{ color: SUBTLE, fontSize: 14 }}>Sign in</Link>
                <Link
                  to="/scan"
                  style={{
                    background: COBALT,
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Start free →
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ position: "fixed", inset: 0, background: NAVY, zIndex: 100, padding: 24 }}
        >
          <div className="flex justify-between items-center mb-10">
            <span style={{ fontWeight: 300, fontSize: 24 }}>nerve</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={22} /></button>
          </div>
          <div className="flex flex-col gap-6 text-lg">
            <Link to="/scan" onClick={() => setMobileOpen(false)}>Scan</Link>
            <Link to="/analyze" onClick={() => setMobileOpen(false)}>SNAG</Link>
            <span style={{ color: SUBTLE }}>ZERO (soon)</span>
            <span style={{ color: SUBTLE }}>Pulse (soon)</span>
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link
                  to="/scan"
                  onClick={() => setMobileOpen(false)}
                  style={{ background: COBALT, padding: "10px 16px", borderRadius: 6, textAlign: "center" }}
                >
                  Start free →
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center" style={{ maxWidth: 760 }}>
          <div
            style={{
              color: COBALT,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            NERVE — Revenue Execution Governance
          </div>
          <h1
            style={{
              fontWeight: 300,
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Revenue has a nervous system.
            <br />
            Yours is running blind.
          </h1>
          <p
            style={{
              color: SUBTLE,
              fontSize: 17,
              lineHeight: 1.6,
              marginTop: 28,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Nerve is a revenue operating system that detects structural failure, examines the
            belief causing it, gates the decision before you commit, and governs execution every
            day after. Four modules. One closed loop.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-10">
            <button
              onClick={() => navigate("/scan")}
              style={{
                background: COBALT,
                color: "white",
                padding: "14px 28px",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
              }}
            >
              Run your free diagnostic →
            </button>
            <button
              onClick={() => scrollTo("system")}
              style={{
                background: "transparent",
                color: "white",
                padding: "14px 28px",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 15,
                border: `1px solid ${COBALT}`,
                cursor: "pointer",
              }}
            >
              See how it works
            </button>
          </div>
          <p style={{ color: SUBTLE, fontSize: 13, marginTop: 20 }}>
            No CRM connection required. Results in 20 minutes.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 w-full mt-16">
          <div style={{ height: 1, background: "rgba(0,71,171,0.15)", marginBottom: 32 }} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              ["87%", "Enterprises missed AI targets"],
              ["88%", "POCs never reach production"],
              ["40%", "Average AI gross retention"],
              ["61%", "Average forecast accuracy"],
              ["$632B", "Enterprise AI market by 2028"],
            ].map(([n, c]) => (
              <div key={c}>
                <div style={{ fontWeight: 300, fontSize: 32, letterSpacing: "-0.02em" }}>{n}</div>
                <div style={{ color: SUBTLE, fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: "rgba(255,255,255,0.02)", padding: "100px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>The Problem</SectionLabel>
          <h2 style={h2Style}>Most revenue problems are not data problems.</h2>
          <p style={{ ...leadStyle, marginLeft: "auto", marginRight: "auto" }}>
            You have a CRM. You have pipeline reviews. You have forecast meetings. You still miss
            the number. The problem is not the data — it is the behavior creating the data, the
            belief driving the behavior, and the absence of a system that connects diagnosis to
            decision to execution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <ProblemCol
              icon={<Unlink size={22} />}
              title="The break goes undetected"
              body="Structural failure in one revenue pillar creates downstream pressure across every other. It compounds quietly until a missed quarter makes it visible."
            />
            <ProblemCol
              icon={<HelpCircle size={22} />}
              title="The belief goes unexamined"
              body="Every broken process is held in place by a belief no one has questioned. The belief was true once. It may not be true now."
            />
            <ProblemCol
              icon={<Shield size={22} />}
              title="The decision goes ungated"
              body="Commitments are made before the failure mode is named. Resources are deployed before the kill criterion is written. The post-mortem happens after the loss."
            />
          </div>
        </div>
      </section>

      {/* SYSTEM */}
      <section id="system" style={{ padding: "100px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>The Nerve System</SectionLabel>
          <h2 style={h2Style}>Four modules. One closed loop.</h2>
          <p style={{ ...leadStyle, marginLeft: "auto", marginRight: "auto" }}>
            Each module works independently. Together they form a complete revenue operating
            system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-16">
            <ModuleCard
              tag="PULSE"
              subtitle="Execution Governance"
              icon={<Activity size={20} />}
              title="Monitors revenue health daily"
              body="Pipeline hygiene scoring, CRM integrity enforcement, deal decay alerts, and manager coaching signals. Pulse tells you what behavior is creating risk right now — not what happened last quarter."
              chip="Continuous monitoring"
              cta="Learn more →"
              onClick={() => scrollTo("system")}
            />
            <ModuleCard
              tag="SCAN"
              subtitle="Revenue Structure Diagnostic"
              icon={<Radar size={20} />}
              title="Identifies the structural break"
              body="Eight-pillar diagnostic scoring across Foundation, Execution, Compounding, and AI layers. Scan identifies the single binding constraint costing you the most — with a financial impact estimate attached."
              chip="Run in 20 minutes"
              cta="Start your Scan →"
              onClick={() => navigate("/scan")}
            />
            <ModuleCard
              tag="ZERO"
              subtitle="Belief Examination"
              icon={<CircleDot size={20} />}
              title="Examines the belief causing it"
              body="Every structural problem is held in place by a belief that has never been questioned. ZERO applies first-principles reasoning to surface that belief, classify it, and determine whether it holds under adversarial examination."
              chip="First-principles reasoning"
              cta="Learn more →"
              onClick={() => navigate("/zero")}
            />
            <ModuleCard
              tag="SNAG"
              subtitle="Decision Gate"
              icon={<GitBranch size={20} />}
              title="Gates every commitment before it moves"
              body="Surface the hidden assumption. Name the failure mode. Set the 30-day alert signal. Write the kill criterion before you commit. No revenue motion proceeds without clearing the gate."
              chip="Pre-commitment discipline"
              cta="Open SNAG →"
              onClick={() => navigate("/analyze")}
            />
          </div>

          <div
            className="mt-10 mx-auto"
            style={{
              border: `1px solid ${COBALT}`,
              borderRadius: 10,
              padding: 28,
              maxWidth: 760,
              background: "rgba(0,71,171,0.05)",
              textAlign: "center",
            }}
          >
            <div style={{ color: COBALT, fontSize: 11, letterSpacing: "0.18em", fontWeight: 500, marginBottom: 8 }}>
              NERVE SYSTEM
            </div>
            <div style={{ fontSize: 20, fontWeight: 400 }}>All four modules unified</div>
            <p style={{ color: SUBTLE, fontSize: 14, lineHeight: 1.6, marginTop: 12, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
              Closed-loop architecture. Pulse feeds problems into Scan. Scan identifies the
              constraint. ZERO examines the belief. SNAG gates the decision. Pulse monitors the
              execution.
            </p>
            <button
              onClick={() => navigate("/diagnostic")}
              style={{
                background: COBALT,
                color: "white",
                padding: "12px 24px",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                marginTop: 20,
              }}
            >
              See full system →
            </button>
          </div>
        </div>
      </section>

      {/* ENTRY POINT */}
      <section style={{ background: "rgba(255,255,255,0.02)", padding: "100px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>Where to Start</SectionLabel>
          <h2 style={h2Style}>Your entry point depends on where the pain is.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
            <EntryCard
              title="Missed quarters and forecast breakdown"
              body="Your pipeline looks healthy. The number does not close. Start with Scan."
              cta="Run Scan →"
              onClick={() => navigate("/scan")}
            />
            <EntryCard
              title="A major decision with no obvious answer"
              body="Pricing change. Market entry. Restructure. You need a decision gate before you commit. Start with SNAG."
              cta="Open SNAG →"
              onClick={() => navigate("/analyze")}
            />
            <EntryCard
              title="Daily execution is deteriorating"
              body="CRM hygiene dropping. Pipeline going stale. Reps not updating. Start with Pulse."
              cta="Coming soon"
              muted
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "100px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>Built by an Operator</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-12 mt-10 items-center">
            <div className="flex justify-center md:justify-start">
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  border: `2px solid ${COBALT}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                  fontWeight: 300,
                  letterSpacing: "0.05em",
                }}
              >
                MI
              </div>
            </div>
            <div>
              <h2 style={{ ...h2Style, textAlign: "left", marginBottom: 16 }}>
                30 years. 120 engagements. One system.
              </h2>
              <p style={{ color: SUBTLE, fontSize: 16, lineHeight: 1.7 }}>
                Nerve is built on The Revenue Circle System™ — a diagnostic framework developed
                across 120+ B2B revenue engagements from $10M to $200M ARR in SaaS, AI, FinTech,
                HRTech, and IT Services.
              </p>
              <p style={{ color: SUBTLE, fontSize: 16, lineHeight: 1.7, marginTop: 14 }}>
                The ZERO framework is the analytical engine behind Nerve's belief examination
                module — documented in <em>First Principles, Done Properly</em>, publishing July
                2026.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                {[
                  ["120+", "Diagnostic engagements"],
                  ["30+", "Years operator experience"],
                  ["$200M+", "ARR advised"],
                  ["8", "Revenue pillars"],
                ].map(([n, c]) => (
                  <div key={c}>
                    <div style={{ fontWeight: 300, fontSize: 28, letterSpacing: "-0.02em" }}>{n}</div>
                    <div style={{ color: SUBTLE, fontSize: 12, marginTop: 4 }}>{c}</div>
                  </div>
                ))}
              </div>

              <a
                href="https://www.linkedin.com/newsletters/the-revenue-circle"
                target="_blank"
                rel="noreferrer"
                style={{ color: COBALT, fontSize: 14, fontWeight: 500, marginTop: 24, display: "inline-block" }}
              >
                Read The Revenue Circle newsletter →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: COBALT, padding: "100px 0" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 style={{ fontWeight: 300, fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Find your binding constraint.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 1.6, marginTop: 16 }}>
            Run the Scan diagnostic free. Eight pillars. Twenty minutes. One number that changes
            where you focus.
          </p>
          <button
            onClick={() => navigate("/scan")}
            style={{
              background: "white",
              color: COBALT,
              padding: "14px 32px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
              marginTop: 32,
            }}
          >
            Start your free Scan →
          </button>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 18 }}>
            No account required to start. No CRM connection needed.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NAVY, padding: "48px 0", borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div style={{ fontWeight: 300, fontSize: 24, letterSpacing: "-0.02em" }}>nerve</div>
            <div style={{ color: SUBTLE, fontSize: 12, marginTop: 6 }}>Revenue Execution Governance</div>
          </div>
          <div className="flex flex-wrap items-center justify-start md:justify-center gap-x-5 gap-y-2" style={{ color: SUBTLE, fontSize: 13 }}>
            <Link to="/scan" style={{ color: SUBTLE }}>Scan</Link>
            <Link to="/analyze" style={{ color: SUBTLE }}>SNAG</Link>
            <span>ZERO</span>
            <span>Pulse</span>
            <Link to="/about" style={{ color: SUBTLE }}>About</Link>
            <a href="https://www.linkedin.com/newsletters/the-revenue-circle" target="_blank" rel="noreferrer" style={{ color: SUBTLE }}>Newsletter</a>
          </div>
          <div className="text-left md:text-right" style={{ color: SUBTLE, fontSize: 12, lineHeight: 1.7 }}>
            <div>Built on The Revenue Circle System™</div>
            <div>© 2026 Roarr Consulting Group</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const h2Style: React.CSSProperties = {
  fontWeight: 300,
  fontSize: "clamp(28px, 4vw, 44px)",
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  textAlign: "center",
  marginTop: 20,
};

const leadStyle: React.CSSProperties = {
  color: SUBTLE,
  fontSize: 16,
  lineHeight: 1.7,
  marginTop: 20,
  maxWidth: 640,
  textAlign: "center",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: COBALT,
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

function NavItem({ label, to, disabled }: { label: string; to?: string; disabled?: boolean }) {
  if (disabled || !to) {
    return <span style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>;
  }
  return (
    <Link to={to} style={{ color: SUBTLE, transition: "color 150ms" }} onMouseEnter={(e) => (e.currentTarget.style.color = "white")} onMouseLeave={(e) => (e.currentTarget.style.color = SUBTLE)}>
      {label}
    </Link>
  );
}

function ProblemCol({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div style={{ color: COBALT, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: SUBTLE, fontSize: 14, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

function ModuleCard({
  tag,
  subtitle,
  icon,
  title,
  body,
  chip,
  cta,
  onClick,
}: {
  tag: string;
  subtitle: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  chip: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(0,71,171,0.25)",
        borderRadius: 8,
        padding: 32,
        transition: "transform 200ms, border-color 200ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,71,171,0.6)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,71,171,0.25)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div style={{ color: COBALT, fontSize: 11, letterSpacing: "0.2em", fontWeight: 600 }}>{tag}</div>
        <div style={{ color: COBALT }}>{icon}</div>
      </div>
      <div style={{ color: SUBTLE, fontSize: 12, marginBottom: 16 }}>{subtitle}</div>
      <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 12, lineHeight: 1.3 }}>{title}</h3>
      <p style={{ color: SUBTLE, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{body}</p>
      <div className="flex items-center justify-between">
        <span
          style={{
            border: `1px solid ${COBALT}`,
            color: COBALT,
            borderRadius: 999,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {chip}
        </span>
        <button
          onClick={onClick}
          style={{ color: COBALT, background: "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

function EntryCard({
  title,
  body,
  cta,
  onClick,
  muted,
}: {
  title: string;
  body: string;
  cta: string;
  onClick?: () => void;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        background: CARD,
        borderLeft: `3px solid ${COBALT}`,
        borderRadius: 6,
        padding: 24,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, marginBottom: 12 }}>{title}</h3>
      <p style={{ color: SUBTLE, fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{body}</p>
      {muted ? (
        <span style={{ color: SUBTLE, fontSize: 13, fontWeight: 500 }}>{cta}</span>
      ) : (
        <button
          onClick={onClick}
          style={{ color: COBALT, background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, padding: 0 }}
        >
          {cta}
        </button>
      )}
    </div>
  );
}
