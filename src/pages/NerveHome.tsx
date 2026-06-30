import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertTriangle,
  HelpCircle,
  ShieldOff,
  Menu,
  X,
  Linkedin,
  Activity,
  ScanLine,
  Search,
  ShieldCheck,
} from "lucide-react";

const MODULES = {
  PULSE: {
    name: "PULSE",
    primary: "#0D9488",
    lightBg: "#F0FDFA",
    borderDefault: "rgba(13,148,136,0.2)",
    borderHover: "rgba(13,148,136,0.7)",
    tagBg: "rgba(13,148,136,0.08)",
  },
  SCAN: {
    name: "SCAN",
    primary: "#0047AB",
    lightBg: "#EFF6FF",
    borderDefault: "rgba(0,71,171,0.2)",
    borderHover: "rgba(0,71,171,0.7)",
    tagBg: "rgba(0,71,171,0.08)",
  },
  ZERO: {
    name: "ZERO",
    primary: "#D97706",
    lightBg: "#FFFBEB",
    borderDefault: "rgba(217,119,6,0.2)",
    borderHover: "rgba(217,119,6,0.7)",
    tagBg: "rgba(217,119,6,0.08)",
  },
  SNAG: {
    name: "SNAG",
    primary: "#BE3455",
    lightBg: "#FFF1F2",
    borderDefault: "rgba(190,52,85,0.2)",
    borderHover: "rgba(190,52,85,0.7)",
    tagBg: "rgba(190,52,85,0.08)",
  },
} as const;

type ModuleKey = keyof typeof MODULES;

function FlowLine({ onDark = false }: { onDark?: boolean }) {
  const sequence: ModuleKey[] = ["PULSE", "SCAN", "ZERO", "SNAG", "PULSE"];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: onDark ? "flex-start" : "center",
        gap: 0,
        rowGap: 8,
      }}
    >
      {sequence.map((key, i) => {
        const m = MODULES[key];
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            <span
              style={{
                background: m.primary,
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: "0.08em",
                padding: "3px 8px",
                borderRadius: 980,
              }}
            >
              {m.name}
            </span>
            {i < sequence.length - 1 && (
              <span
                style={{
                  margin: "0 6px",
                  fontSize: 12,
                  color: onDark ? "rgba(255,255,255,0.3)" : "#9CA3AF",
                }}
              >
                →
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function ColoredModuleCard({
  moduleKey,
  Icon,
  tier,
  headline,
  body,
  cta,
  tag,
  onClick,
}: {
  moduleKey: ModuleKey;
  Icon: React.ComponentType<any>;
  tier: string;
  headline: string;
  body: string;
  cta: string;
  tag: string;
  onClick: () => void;
}) {
  const m = MODULES[moduleKey];
  const [hover, setHover] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? m.lightBg : "#FFFFFF",
        border: `1px solid ${hover ? m.borderHover : m.borderDefault}`,
        borderRadius: 16,
        padding: 40,
        transition: "all 0.3s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hover ? "0 12px 40px rgba(0,0,0,0.08)" : "none",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            background: m.tagBg,
            padding: 8,
            borderRadius: 8,
            display: "inline-flex",
          }}
        >
          <Icon size={28} color={m.primary} strokeWidth={1.75} />
        </div>
        <span
          style={{
            background: m.primary,
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "4px 12px",
            borderRadius: 980,
          }}
        >
          {m.name}
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#6B7280" }}>{tier}</div>
      <h3
        style={{
          marginTop: 28,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 22,
          color: "#0A1628",
          lineHeight: 1.3,
        }}
      >
        {headline}
      </h3>
      <p
        style={{
          marginTop: 14,
          fontSize: 16,
          color: "#6B7280",
          lineHeight: 1.65,
          flex: 1,
        }}
      >
        {body}
      </p>
      <div
        style={{
          marginTop: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <button
          onClick={onClick}
          onMouseEnter={() => setCtaHover(true)}
          onMouseLeave={() => setCtaHover(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 15,
            color: m.primary,
            textDecoration: ctaHover ? "underline" : "none",
            textAlign: "left",
          }}
        >
          {cta} →
        </button>
        <span
          style={{
            fontSize: 13,
            color: m.primary,
            background: m.tagBg,
            padding: "4px 10px",
            borderRadius: 980,
            whiteSpace: "nowrap",
          }}
        >
          {tag}
        </span>
      </div>
    </div>
  );
}

const NAVY = "#0A1628";
const COBALT = "#0047AB";
const COBALT_DARK = "#003a8a";
const TEXT_SECONDARY = "#6B7280";
const BORDER = "#E5E7EB";
const CARD_BG = "#F9FAFB";

/* ---------------- Reveal on scroll ---------------- */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- Buttons ---------------- */
function PrimaryBtn({
  children,
  onClick,
  small = false,
  invert = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  small?: boolean;
  invert?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const bg = invert ? "#FFFFFF" : hover ? COBALT_DARK : COBALT;
  const color = invert ? NAVY : "#FFFFFF";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: bg,
        color,
        borderRadius: 980,
        padding: small ? "10px 20px" : "16px 32px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: small ? 13 : 15,
        border: "none",
        cursor: "pointer",
        boxShadow: hover && !invert ? "0 8px 24px rgba(0,71,171,0.25)" : "none",
        transition: "all 0.25s ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({
  children,
  onClick,
  onDark = false,
  small = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  onDark?: boolean;
  small?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const baseColor = onDark ? "#FFFFFF" : NAVY;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? baseColor : "transparent",
        color: hover ? (onDark ? NAVY : "#FFFFFF") : baseColor,
        borderRadius: 980,
        padding: small ? "10px 20px" : "16px 32px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: small ? 13 : 15,
        border: `1.5px solid ${baseColor}`,
        cursor: "pointer",
        transition: "all 0.25s ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Pulse", to: "/pulse" },
    { label: "Scan", to: "/scan" },
    { label: "ZERO", to: "/zero" },
    { label: "SNAG", to: "/analyze" },
  ];
  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${BORDER}`,
          zIndex: 100,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            height: "100%",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontWeight: 300,
                fontSize: 18,
                color: NAVY,
                letterSpacing: "-0.02em",
              }}
            >
              nerve
            </span>
            <span style={{ width: 1, height: 16, background: BORDER }} />
            <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>by Roarr</span>
          </Link>

          <div
            className="nerve-nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {links.map((l, i) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Link
                  to={l.to}
                  style={{
                    fontSize: 15,
                    color: TEXT_SECONDARY,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = NAVY)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_SECONDARY)}
                >
                  {l.label}
                </Link>
                {i < links.length - 1 && (
                  <span style={{ color: BORDER, fontSize: 8 }}>•</span>
                )}
              </div>
            ))}
          </div>

          <div className="nerve-nav-right" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {user ? (
              <PrimaryBtn small onClick={() => navigate("/dashboard")}>
                Dashboard
              </PrimaryBtn>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    fontSize: 15,
                    color: TEXT_SECONDARY,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = NAVY)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_SECONDARY)}
                >
                  Sign in
                </Link>
                <PrimaryBtn small onClick={() => navigate("/signup")}>
                  Get started
                </PrimaryBtn>
              </>
            )}
          </div>

          <button
            className="nerve-nav-hamburger"
            onClick={() => setOpen(true)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: NAVY,
            }}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#FFFFFF",
            zIndex: 200,
            padding: 32,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 300, fontSize: 18, color: NAVY }}>nerve</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: NAVY, cursor: "pointer" }}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 24 }}>
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                style={{ fontSize: 24, color: NAVY, textDecoration: "none", fontWeight: 300 }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ height: 1, background: BORDER, margin: "16px 0" }} />
            {user ? (
              <PrimaryBtn onClick={() => { setOpen(false); navigate("/dashboard"); }}>
                Dashboard
              </PrimaryBtn>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  style={{ fontSize: 18, color: TEXT_SECONDARY, textDecoration: "none" }}
                >
                  Sign in
                </Link>
                <PrimaryBtn onClick={() => { setOpen(false); navigate("/signup"); }}>
                  Get started
                </PrimaryBtn>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nerve-nav-links { display: none !important; }
          .nerve-nav-right { display: none !important; }
          .nerve-nav-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}

/* ---------------- Shared atoms ---------------- */
const SectionLabel = ({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) => (
  <div
    style={{
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: 12,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: onDark ? "#4D8BE0" : COBALT,
      marginBottom: 24,
    }}
  >
    {children}
  </div>
);

const SectionHeading = ({
  children,
  onDark = false,
  size = 48,
}: {
  children: React.ReactNode;
  onDark?: boolean;
  size?: number;
}) => (
  <h2
    style={{
      fontFamily: "Inter, sans-serif",
      fontWeight: 300,
      fontSize: size,
      letterSpacing: "-0.03em",
      lineHeight: 1.1,
      color: onDark ? "#FFFFFF" : NAVY,
      margin: 0,
    }}
    className="nerve-section-heading"
  >
    {children}
  </h2>
);

/* ---------------- Module card ---------------- */
function ModuleCard({
  name,
  tier,
  headline,
  body,
  cta,
  ctaHref,
  tag,
  onClick,
}: {
  name: string;
  tier: string;
  headline: string;
  body: string;
  cta: string;
  ctaHref?: string;
  tag: string;
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: CARD_BG,
        border: `1px solid ${hover ? "rgba(0,71,171,0.4)" : BORDER}`,
        borderRadius: 16,
        padding: 40,
        transition: "all 0.3s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hover ? "0 20px 40px rgba(10,22,40,0.08)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            background: COBALT,
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "4px 12px",
            borderRadius: 980,
          }}
        >
          {name}
        </span>
        <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>{tier}</span>
      </div>
      <h3
        style={{
          marginTop: 32,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 22,
          color: NAVY,
          lineHeight: 1.3,
        }}
      >
        {headline}
      </h3>
      <p
        style={{
          marginTop: 16,
          fontSize: 16,
          color: TEXT_SECONDARY,
          lineHeight: 1.65,
          flex: 1,
        }}
      >
        {body}
      </p>
      {ctaHref ? (
        <Link
          to={ctaHref}
          style={{
            marginTop: 24,
            fontWeight: 500,
            fontSize: 15,
            color: COBALT,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          {cta}
        </Link>
      ) : (
        <button
          onClick={onClick}
          style={{
            marginTop: 24,
            fontWeight: 500,
            fontSize: 15,
            color: COBALT,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {cta}
        </button>
      )}
      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: `1px solid ${BORDER}`,
          fontSize: 14,
          color: TEXT_SECONDARY,
        }}
      >
        {tag}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function NerveHome() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const submitWaitlist = () => {
    if (!waitlistEmail.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem("nerve_pulse_waitlist") || "[]");
      existing.push({ email: waitlistEmail.trim(), at: new Date().toISOString() });
      localStorage.setItem("nerve_pulse_waitlist", JSON.stringify(existing));
    } catch {}
    setWaitlistDone(true);
  };

  const stats = [
    ["87%", "Enterprises missed AI revenue targets"],
    ["88%", "POCs never reach production"],
    ["40%", "Average AI gross revenue retention"],
    ["61%", "Average forecast accuracy at quarter close"],
    ["120+", "Diagnostic engagements behind this system"],
  ];

  const problems = [
    {
      Icon: AlertTriangle,
      headline: "The break goes undetected",
      body:
        "Structural failure in one revenue pillar creates downstream pressure across every other. It compounds quietly until a missed quarter makes it visible.",
    },
    {
      Icon: HelpCircle,
      headline: "The belief goes unexamined",
      body:
        "Every broken process is held in place by a belief no one has questioned. The belief was true once. The market moved. The belief did not.",
    },
    {
      Icon: ShieldOff,
      headline: "The decision goes ungated",
      body:
        "Commitments are made before the failure mode is named. Resources are deployed before the kill criterion is written. The post-mortem happens after the loss.",
    },
  ];

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: NAVY,
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      <Nav />

      {/* ============ SECTION 1 — HERO ============ */}
      <section
        style={{
          padding: "160px 24px 140px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COBALT,
                marginBottom: 32,
              }}
            >
              Nerve · Revenue Execution Governance
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              className="nerve-hero-h1"
              style={{
                fontWeight: 300,
                fontSize: 72,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: NAVY,
                margin: 0,
              }}
            >
              Revenue has
              <br />a nervous system.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <h2
              className="nerve-hero-h2"
              style={{
                marginTop: 20,
                fontWeight: 300,
                fontSize: 72,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: COBALT,
              }}
            >
              Yours is running blind.
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p
              style={{
                marginTop: 40,
                maxWidth: 560,
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: 19,
                lineHeight: 1.7,
                color: TEXT_SECONDARY,
              }}
            >
              Nerve detects structural failure in your revenue system, examines
              the belief causing it, gates the decision before you commit, and
              monitors execution every day after.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div
              style={{
                marginTop: 40,
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <PrimaryBtn onClick={() => navigate("/scan")}>
                Run your free Scan →
              </PrimaryBtn>
              <SecondaryBtn onClick={() => scrollTo("problem")}>
                See how it works
              </SecondaryBtn>
            </div>
          </Reveal>
          <Reveal delay={0.5}>
            <div
              style={{
                marginTop: 24,
                fontSize: 14,
                color: TEXT_SECONDARY,
              }}
            >
              No CRM connection required · Results in 20 minutes · Free to start
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 2 — STATS ============ */}
      <section
        style={{
          background: CARD_BG,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "60px 24px",
        }}
      >
        <div
          className="nerve-stats"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
          }}
        >
          {stats.map(([num, label], i) => (
            <Reveal key={num} delay={i * 0.06}>
              <div
                style={{
                  textAlign: "center",
                  padding: "0 16px",
                  borderRight:
                    i < stats.length - 1 ? `1px solid ${BORDER}` : "none",
                }}
                className="nerve-stat-item"
              >
                <div
                  style={{
                    fontWeight: 300,
                    fontSize: 48,
                    color: NAVY,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: TEXT_SECONDARY,
                    marginTop: 8,
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ SECTION 3 — THE PROBLEM ============ */}
      <section
        id="problem"
        style={{ padding: "140px 24px", background: "#FFFFFF" }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <SectionLabel>The Structural Failure</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading>
              Most revenue problems are not data problems.
            </SectionHeading>
          </Reveal>
          <Reveal delay={0.2}>
            <p
              style={{
                marginTop: 32,
                maxWidth: 640,
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: 19,
                color: TEXT_SECONDARY,
                lineHeight: 1.7,
              }}
            >
              You have a CRM. You have pipeline reviews. You have forecast
              meetings. You still miss the number. The failure is structural —
              it lives in the belief no one has examined, the decision no one
              has gated, and the execution no one is watching.
            </p>
          </Reveal>
        </div>

        <div
          className="nerve-problem-grid"
          style={{
            maxWidth: 1100,
            margin: "80px auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 48,
          }}
        >
          {problems.map((p, i) => (
            <Reveal key={p.headline} delay={i * 0.1}>
              <div>
                <p.Icon size={32} color={COBALT} strokeWidth={1.5} />
                <h3
                  style={{
                    marginTop: 20,
                    fontWeight: 500,
                    fontSize: 18,
                    color: NAVY,
                  }}
                >
                  {p.headline}
                </h3>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 16,
                    color: TEXT_SECONDARY,
                    lineHeight: 1.6,
                  }}
                >
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ SECTION 4 — FOUR MODULES ============ */}
      <section style={{ padding: "140px 24px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <SectionLabel>The Nerve System</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading>Four modules.</SectionHeading>
          </Reveal>
          <Reveal delay={0.15}>
            <h2
              className="nerve-section-heading"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
                fontSize: 48,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "8px 0 0",
              }}
            >
              <span style={{ color: MODULES.PULSE.primary }}>Pulse.</span>
              <span style={{ color: MODULES.SCAN.primary }}> Scan.</span>
              <span style={{ color: MODULES.ZERO.primary }}> ZERO.</span>
              <span style={{ color: MODULES.SNAG.primary }}> SNAG.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p
              style={{
                marginTop: 24,
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: 19,
                color: TEXT_SECONDARY,
                lineHeight: 1.7,
              }}
            >
              Each module works independently. Together they form a complete
              revenue operating system.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <FlowLine />
            </div>
          </Reveal>
        </div>

        <div
          className="nerve-modules-grid"
          style={{
            maxWidth: 1100,
            margin: "48px auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <Reveal delay={0}>
            <ColoredModuleCard
              moduleKey="PULSE"
              Icon={Activity}
              tier="Execution Governance"
              headline="Monitors revenue health daily"
              body="Pipeline hygiene scoring, CRM integrity enforcement, deal decay alerts, and manager coaching signals. Pulse tells you what behavior is creating risk right now — not what happened last quarter."
              cta="Join waitlist →"
              tag="Launching soon"
              onClick={() => setWaitlistOpen(true)}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ColoredModuleCard
              moduleKey="SCAN"
              Icon={ScanLine}
              tier="Revenue Structure Diagnostic"
              headline="Identifies the structural break"
              body="Eight-pillar diagnostic across Foundation, Execution, Compounding, and AI layers. One binding constraint. One financial impact number. Twenty minutes."
              cta="Run your free Scan"
              tag="Free · 20 minutes"
              onClick={() => navigate("/scan")}
            />
          </Reveal>
          <Reveal delay={0.2}>
            <ColoredModuleCard
              moduleKey="ZERO"
              Icon={Search}
              tier="Belief Examination"
              headline="Examines the belief causing it"
              body="Every structural problem is held in place by a belief no one has questioned. ZERO applies first-principles reasoning to surface it, classify it, and determine whether it holds under adversarial examination."
              cta="Learn more"
              tag="First-principles"
              onClick={() => navigate("/zero")}
            />
          </Reveal>
          <Reveal delay={0.3}>
            <ColoredModuleCard
              moduleKey="SNAG"
              Icon={ShieldCheck}
              tier="Decision Gate"
              headline="Gates every commitment before it moves"
              body="Surface the hidden assumption. Name the failure mode. Set the 30-day alert signal. Write the kill criterion before you commit. No revenue motion proceeds without clearing the gate."
              cta="Open SNAG"
              tag="Pre-commitment gate"
              onClick={() => navigate("/analyze")}
            />
          </Reveal>
        </div>

        {/* Connector card */}
        <Reveal delay={0.4}>
          <div
            className="nerve-connector"
            style={{
              maxWidth: 1100,
              margin: "24px auto 0",
              background: NAVY,
              borderRadius: 16,
              padding: "48px 56px",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 32,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COBALT,
                  marginBottom: 16,
                }}
              >
                Nerve System
              </div>
              <h3
                style={{
                  fontWeight: 300,
                  fontSize: 28,
                  color: "#FFFFFF",
                  lineHeight: 1.2,
                  margin: 0,
                  marginBottom: 16,
                  letterSpacing: "-0.02em",
                }}
              >
                All four modules. One closed loop.
              </h3>
              <FlowLine onDark />
              <p
                style={{
                  marginTop: 16,
                  maxWidth: 480,
                  fontSize: 15,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.65,
                }}
              >
                Pulse detects execution decay. Scan identifies the constraint.
                ZERO examines the belief. SNAG gates the decision. Pulse
                monitors what happens next.
              </p>
            </div>
            <div style={{ flexShrink: 0, marginLeft: 48 }} className="nerve-connector-cta">
              <PrimaryBtn invert onClick={() => navigate("/diagnostic")}>
                See full system →
              </PrimaryBtn>
            </div>
          </div>
        </Reveal>
      </section>



      {/* ============ SECTION 5 — ENTRY POINT SELECTOR ============ */}
      <section
        style={{
          padding: "140px 24px",
          background: CARD_BG,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <SectionLabel>Where to start</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading>
              Your entry point depends on where the pain is.
            </SectionHeading>
          </Reveal>
        </div>

        <div
          className="nerve-entry-grid"
          style={{
            maxWidth: 1100,
            margin: "64px auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {[
            {
              label: "Missed Quarters",
              headline: "Pipeline looks healthy. Number does not close.",
              body:
                "Start with Scan. Eight-pillar diagnostic identifies the structural break in twenty minutes.",
              cta: "Run Scan →",
              onClick: () => navigate("/scan"),
              primary: true,
            },
            {
              label: "Major Decision",
              headline: "Pricing change. Market entry. Restructure.",
              body:
                "Start with SNAG. Gate the decision before you commit resources.",
              cta: "Open SNAG →",
              onClick: () => navigate("/analyze"),
              primary: true,
            },
            {
              label: "Execution Decay",
              headline: "CRM hygiene dropping. Pipeline going stale.",
              body:
                "Start with Pulse. Daily monitoring of what behavior is creating risk.",
              cta: "Join waitlist →",
              onClick: () => {
                setWaitlistDone(false);
                setWaitlistEmail("");
                setWaitlistOpen(true);
              },
              primary: false,
            },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 0.1}>
              <div
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${BORDER}`,
                  borderLeft: `3px solid ${COBALT}`,
                  borderRadius: 12,
                  padding: 32,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: COBALT,
                  }}
                >
                  {c.label}
                </div>
                <h3
                  style={{
                    marginTop: 16,
                    fontWeight: 500,
                    fontSize: 20,
                    color: NAVY,
                    lineHeight: 1.3,
                  }}
                >
                  {c.headline}
                </h3>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 15,
                    color: TEXT_SECONDARY,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {c.body}
                </p>
                <div style={{ marginTop: 24 }}>
                  {c.primary ? (
                    <PrimaryBtn small onClick={c.onClick}>
                      {c.cta}
                    </PrimaryBtn>
                  ) : (
                    <SecondaryBtn small onClick={c.onClick}>
                      {c.cta}
                    </SecondaryBtn>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ SECTION 6 — AUTHORITY ============ */}
      <section style={{ padding: "140px 24px", background: "#FFFFFF" }}>
        <div
          className="nerve-authority"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "60fr 40fr",
            gap: 80,
            alignItems: "center",
          }}
        >
          <Reveal>
            <div>
              <SectionLabel>Built by an operator</SectionLabel>
              <SectionHeading size={40}>
                30 years. 120 engagements. One system.
              </SectionHeading>
              <p
                style={{
                  marginTop: 32,
                  fontSize: 18,
                  color: TEXT_SECONDARY,
                  lineHeight: 1.7,
                }}
              >
                Nerve is built on The Revenue Circle System™ — developed across
                120+ B2B revenue engagements from $10M to $200M ARR in SaaS, AI,
                FinTech, HRTech, and IT Services.
              </p>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 18,
                  color: TEXT_SECONDARY,
                  lineHeight: 1.7,
                }}
              >
                The ZERO framework, the analytical engine behind Nerve's belief
                examination module, is documented in First Principles, Done
                Properly — publishing July 2026 on KDP and Notion Press.
              </p>

              <div
                style={{
                  marginTop: 40,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  maxWidth: 480,
                }}
              >
                {[
                  ["120+", "Diagnostic engagements"],
                  ["30+", "Years operator experience"],
                  ["$200M+", "ARR under advisory"],
                  ["8", "Revenue pillars"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div
                      style={{
                        fontWeight: 300,
                        fontSize: 36,
                        color: NAVY,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {n}
                    </div>
                    <div style={{ fontSize: 14, color: TEXT_SECONDARY, marginTop: 4 }}>
                      {l}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://www.linkedin.com/newsletters/the-revenue-circle-7286791867088379905/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 40,
                  color: COBALT,
                  fontSize: 15,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Read The Revenue Circle → 2,247 subscribers
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div
              style={{
                background: CARD_BG,
                borderRadius: 16,
                padding: 48,
                border: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  fontWeight: 300,
                  fontSize: 80,
                  color: COBALT,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                MI
              </div>
              <div
                style={{
                  marginTop: 24,
                  fontWeight: 500,
                  fontSize: 18,
                  color: NAVY,
                }}
              >
                Mahesh Iyer
              </div>
              <div style={{ marginTop: 4, fontSize: 15, color: TEXT_SECONDARY }}>
                Global AI Enterprise Revenue Leader
              </div>
              <div style={{ margin: "24px 0", height: 1, background: BORDER }} />
              <p
                style={{
                  fontWeight: 300,
                  fontStyle: "italic",
                  fontSize: 18,
                  color: NAVY,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                "Revenue is a system, not an accident."
              </p>
              <div style={{ marginTop: 16, fontSize: 14, color: TEXT_SECONDARY }}>
                — The Revenue Circle System™
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 7 — FINAL CTA ============ */}
      <section
        style={{
          background: NAVY,
          padding: "140px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel onDark>Get started</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="nerve-final-h2"
              style={{
                fontWeight: 300,
                fontSize: 56,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Find your binding constraint.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p
              style={{
                marginTop: 32,
                fontSize: 19,
                color: "rgba(255,255,255,0.6)",
                maxWidth: 480,
                margin: "32px auto 0",
                lineHeight: 1.7,
              }}
            >
              Run the Scan diagnostic free. Eight pillars. Twenty minutes. One
              number that changes where you focus.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div
              style={{
                marginTop: 40,
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <PrimaryBtn invert onClick={() => navigate("/scan")}>
                Start your free Scan →
              </PrimaryBtn>
              <SecondaryBtn onDark onClick={() => window.open("https://calendly.com", "_blank")}>
                Book 20 minutes →
              </SecondaryBtn>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div
              style={{
                marginTop: 24,
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              No account required · No CRM connection · Free to start
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        style={{
          background: "#FFFFFF",
          borderTop: `1px solid ${BORDER}`,
          padding: "48px 24px",
        }}
      >
        <div
          className="nerve-footer"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 48,
          }}
        >
          <div>
            <div style={{ fontWeight: 300, fontSize: 20, color: NAVY }}>
              nerve
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: TEXT_SECONDARY }}>
              Revenue Execution Governance
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: TEXT_SECONDARY }}>
              Built on The Revenue Circle System™
            </div>
          </div>

          <div style={{ display: "flex", gap: 48 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, color: NAVY }}>
                Modules
              </div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Pulse", "/pulse"],
                  ["Scan", "/scan"],
                  ["ZERO", "/zero"],
                  ["SNAG", "/analyze"],
                ].map(([l, h]) => (
                  <Link
                    key={l}
                    to={h}
                    style={{ fontSize: 14, color: TEXT_SECONDARY, textDecoration: "none" }}
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, color: NAVY }}>
                Company
              </div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to="/about" style={{ fontSize: 14, color: TEXT_SECONDARY, textDecoration: "none" }}>
                  About
                </Link>
                <a
                  href="https://www.linkedin.com/newsletters/the-revenue-circle-7286791867088379905/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 14, color: TEXT_SECONDARY, textDecoration: "none" }}
                >
                  Newsletter
                </a>
                <Link to="/book" style={{ fontSize: 14, color: TEXT_SECONDARY, textDecoration: "none" }}>
                  Book
                </Link>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }} className="nerve-footer-right">
            <div style={{ fontSize: 13, color: TEXT_SECONDARY }}>
              © 2026 Roarr Consulting Group
            </div>
            <a
              href="mailto:mahesh@roarrglobal.com"
              style={{
                display: "inline-block",
                marginTop: 8,
                fontSize: 13,
                color: COBALT,
                textDecoration: "none",
              }}
            >
              mahesh@roarrglobal.com
            </a>
            <div style={{ marginTop: 12 }}>
              <a
                href="https://www.linkedin.com/in/maheshiyer/"
                target="_blank"
                rel="noreferrer"
                style={{ color: TEXT_SECONDARY }}
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ WAITLIST MODAL ============ */}
      {waitlistOpen && (
        <div
          onClick={() => setWaitlistOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,22,40,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 40,
              maxWidth: 440,
              width: "100%",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <h3
              style={{
                fontWeight: 300,
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: NAVY,
                margin: 0,
              }}
            >
              {waitlistDone ? "You're on the list." : "Pulse launches soon"}
            </h3>
            {!waitlistDone ? (
              <>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    marginTop: 24,
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 980,
                    fontSize: 15,
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    color: NAVY,
                  }}
                />
                <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <SecondaryBtn small onClick={() => setWaitlistOpen(false)}>
                    Cancel
                  </SecondaryBtn>
                  <PrimaryBtn small onClick={submitWaitlist}>
                    Notify me →
                  </PrimaryBtn>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                <PrimaryBtn small onClick={() => setWaitlistOpen(false)}>
                  Close
                </PrimaryBtn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .nerve-hero-h1, .nerve-hero-h2 { font-size: 48px !important; }
          .nerve-section-heading { font-size: 32px !important; }
          .nerve-final-h2 { font-size: 40px !important; }
          .nerve-stats { grid-template-columns: 1fr 1fr !important; gap: 32px; }
          .nerve-stat-item { border-right: none !important; }
          .nerve-problem-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .nerve-modules-grid { grid-template-columns: 1fr !important; }
          .nerve-entry-grid { grid-template-columns: 1fr !important; }
          .nerve-connector { grid-template-columns: 1fr !important; }
          .nerve-connector-cta { text-align: left !important; }
          .nerve-authority { grid-template-columns: 1fr !important; gap: 48px !important; }
          .nerve-footer { grid-template-columns: 1fr !important; gap: 32px !important; }
          .nerve-footer-right { text-align: left !important; }
        }
        @media (max-width: 600px) {
          .nerve-hero-h1, .nerve-hero-h2 { font-size: 36px !important; }
          .nerve-section-heading { font-size: 28px !important; }
          .nerve-final-h2 { font-size: 32px !important; }
        }
      `}</style>
    </div>
  );
}
