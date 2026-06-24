import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, RefreshCw, XCircle, HelpCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PILLARS, CALENDLY_URL } from "@/scan/pillars";
import { saveZeroSession } from "@/lib/saveZeroSession";

const AMBER = "#D97706";
const AMBER_HOVER = "#B45309";
const AMBER_LIGHT = "#FFFBEB";
const AMBER_DARK = "#78350F";
const NAVY = "#0A1628";
const BORDER = "#E5E7EB";

interface BeliefEntry {
  belief: string;
  counter: string;
}

const BELIEFS: Record<number, BeliefEntry> = {
  1: {
    belief: "We know who our best customers are because we have been selling to them for years.",
    counter: "If you removed every customer acquired before your current ICP definition existed, what would your win rate, deal size, and NRR look like — and does that data confirm the ICP you are currently using?",
  },
  2: {
    belief: "Our pipeline problem is volume — we need more leads, more activity, more coverage.",
    counter: "What is the conversion rate from your top quartile pipeline versus your bottom quartile — and if you ran only top-quartile pipeline, would you need more volume or less?",
  },
  3: {
    belief: "Our CRM data reflects what is actually happening in our pipeline.",
    counter: "When your forecast is wrong, do the errors trace back to bad data in the CRM, or bad judgment applied to accurate data — and have you measured which is more frequent?",
  },
  4: {
    belief: "Our deals are long because enterprise buying cycles are long.",
    counter: "Of your last ten losses to no-decision, how many had a mutual action plan with customer-signed milestones — and did the presence or absence of a MAP correlate with cycle length?",
  },
  5: {
    belief: "Our managers coach their reps — we see it in our 1:1 cadences.",
    counter: "What percentage of your 1:1 time last quarter was spent on deal inspection versus skill development — and do your reps report that the coaching changed how they sell?",
  },
  6: {
    belief: "We are retaining our customers because our churn rate is within industry benchmarks.",
    counter: "Of the customers who renewed last year, what percentage expanded — and is your NRR above or below 100%, and by cohort or only in aggregate?",
  },
  7: {
    belief: "Our teams are using AI tools responsibly because we have not seen any problems yet.",
    counter: "What is the mechanism by which you would detect an AI-generated error in a customer-facing output before it caused commercial damage — and has that mechanism been tested?",
  },
  8: {
    belief: "Our AI tools are making our revenue team more productive.",
    counter: "What is the measured productivity improvement per AE from your AI stack — in hours recovered or pipeline velocity — and does that number justify the combined licence cost and training overhead?",
  },
};

type Classification = "STRUCTURALLY-TRUE" | "PRECEDENT-TRUE" | "ANALOGY-TRUE";
type Verdict = "SURVIVE" | "SURVIVE_MODIFIED" | "FAIL" | "INDETERMINATE";
type Origin = "direct" | "external" | "inherited";

interface ScanBinding {
  pillarId: number;
  pillarName: string;
  tier: string;
  total: number;
  evidence?: { question: string; score: number }[];
}

export default function Zero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Parse scan context
  const scanBinding: ScanBinding | null = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("nerve_scan_binding_constraint");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const [emailGate, setEmailGate] = useState(() => !user && !scanBinding && !sessionStorage.getItem("nerve_zero_guest"));
  const [guestEmail, setGuestEmail] = useState("");

  const [selectedPillarId, setSelectedPillarId] = useState<number | null>(scanBinding?.pillarId ?? null);
  const pillar = selectedPillarId ? PILLARS.find(p => p.id === selectedPillarId) ?? null : null;
  const beliefEntry = selectedPillarId ? BELIEFS[selectedPillarId] : null;

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [classificationOverride, setClassificationOverride] = useState<Classification | null>(null);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [response, setResponse] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [modification, setModification] = useState("");
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [saved, setSaved] = useState(false);

  const autoClassification: Classification = useMemo(() => {
    if (scanBinding) {
      const ev = scanBinding.evidence || [];
      const min = ev.length ? Math.min(...ev.map(e => e.score)) : 5;
      const max = ev.length ? Math.max(...ev.map(e => e.score)) : 0;
      if (min <= 2 && max >= 4) return "STRUCTURALLY-TRUE";
      if (scanBinding.total <= 12) return "ANALOGY-TRUE";
      if (scanBinding.total <= 18) return "PRECEDENT-TRUE";
    }
    if (origin === "direct") return "PRECEDENT-TRUE";
    if (origin === "external") return "ANALOGY-TRUE";
    if (origin === "inherited") return "ANALOGY-TRUE";
    return "PRECEDENT-TRUE";
  }, [origin, scanBinding]);

  const classification = classificationOverride ?? autoClassification;

  const completeAndSave = async () => {
    if (!pillar || !beliefEntry || !verdict) return;
    const scanSessionId = sessionStorage.getItem("nerve_scan_session_id");
    await saveZeroSession({
      pillarNumber: pillar.id,
      pillarName: pillar.name,
      beliefStatement: beliefEntry.belief,
      originSelection: origin,
      classification,
      counterPositionResponse: response || null,
      verdict,
      modificationNote: verdict === "SURVIVE_MODIFIED" ? (modification || null) : null,
      scanSessionId,
    });
    setSaved(true);
  };

  useEffect(() => {
    if (verdict && !saved) completeAndSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verdict]);

  // STATE C — email gate
  if (emailGate) {
    return (
      <Shell scanBinding={null}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px" }}>
          <h1 style={{ fontWeight: 300, fontSize: 36, color: NAVY, letterSpacing: "-0.02em" }}>
            Examine the belief.
          </h1>
          <p style={{ color: "#475569", marginTop: 16, fontSize: 16, lineHeight: 1.6 }}>
            ZERO surfaces the load-bearing belief behind a revenue pillar and tests whether it holds.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/.+@.+\..+/.test(guestEmail)) return;
              localStorage.setItem("nerve_scan_email", guestEmail);
              sessionStorage.setItem("nerve_zero_guest", "true");
              setEmailGate(false);
            }}
            style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              style={{
                padding: "14px 16px",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                fontSize: 16,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: AMBER,
                color: "white",
                fontWeight: 500,
                padding: "14px 20px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 15,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = AMBER_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = AMBER)}
            >
              Begin →
            </button>
            <p style={{ fontSize: 13, color: "#64748B" }}>
              Already have an account? <Link to="/login" style={{ color: AMBER, fontWeight: 500 }}>Sign in →</Link>
            </p>
          </form>
        </main>
      </Shell>
    );
  }

  // STATE B — pillar selector (no Scan context, no pillar yet)
  if (!pillar) {
    return (
      <Shell scanBinding={null}>
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
          <h1 style={{ fontWeight: 300, fontSize: 32, color: NAVY, letterSpacing: "-0.02em" }}>
            Which revenue pillar are you examining?
          </h1>
          <p style={{ color: "#475569", fontSize: 16, marginTop: 12, maxWidth: 680, lineHeight: 1.55 }}>
            Select the pillar your team believes is breaking. ZERO will surface the load-bearing belief and examine whether it holds.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 32,
            }}
          >
            {PILLARS.map((p) => {
              const isSelected = selectedPillarId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPillarId(p.id)}
                  style={{
                    textAlign: "left",
                    position: "relative",
                    background: isSelected ? AMBER_LIGHT : "white",
                    border: isSelected ? `2px solid ${AMBER}` : `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: 24,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {isSelected && (
                    <Check size={18} style={{ position: "absolute", top: 16, right: 16, color: AMBER }} />
                  )}
                  <div style={{ fontWeight: 600, fontSize: 11, color: AMBER, letterSpacing: "0.08em" }}>
                    {p.code}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 16, color: NAVY, marginTop: 8 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{p.tier}</div>
                </button>
              );
            })}
          </div>

          <button
            disabled={!selectedPillarId}
            onClick={() => setStage(1)}
            style={{
              marginTop: 32,
              background: selectedPillarId ? AMBER : "#E5E7EB",
              color: selectedPillarId ? "white" : "#94A3B8",
              border: "none",
              padding: "14px 28px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              cursor: selectedPillarId ? "pointer" : "not-allowed",
            }}
          >
            Begin Examination →
          </button>
        </main>
      </Shell>
    );
  }

  // MAIN EXAMINATION FLOW
  return (
    <Shell scanBinding={scanBinding} pillarName={pillar.name}>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }}>
        {/* Stepper */}
        <aside>
          <div style={{ position: "sticky", top: 96 }}>
            {[
              { n: 1, name: "Surface" },
              { n: 2, name: "Classify" },
              { n: 3, name: "Examine" },
              { n: 4, name: "Verdict" },
            ].map(s => {
              const active = stage === s.n;
              const done = stage > s.n;
              const locked = stage < s.n;
              return (
                <button
                  key={s.n}
                  onClick={() => !locked && setStage(s.n as 1|2|3|4)}
                  disabled={locked}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "10px 8px",
                    background: "transparent", border: "none",
                    cursor: locked ? "not-allowed" : "pointer",
                    color: locked ? "#CBD5E1" : active ? AMBER : done ? AMBER : "#64748B",
                    fontWeight: active ? 600 : 500,
                    fontSize: 14,
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: active || done ? AMBER : "transparent",
                    color: active || done ? "white" : "#94A3B8",
                    border: locked ? `1px solid #CBD5E1` : `1px solid ${active || done ? AMBER : "#94A3B8"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {done ? <Check size={14} /> : s.n}
                  </span>
                  {s.name}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Stages */}
        <div>
          {stage === 1 && (
            <StageWrap num="01" name="Surface" sub="The belief your organisation is holding">
              <blockquote style={{
                borderLeft: `3px solid ${AMBER}`,
                background: AMBER_LIGHT,
                borderRadius: "0 8px 8px 0",
                padding: "24px 28px",
                margin: 0,
                fontStyle: "italic",
                fontSize: 18,
                color: AMBER_DARK,
                lineHeight: 1.65,
              }}>
                "{beliefEntry!.belief}"
              </blockquote>

              <div style={{ marginTop: 32 }}>
                <div style={{ fontWeight: 500, fontSize: 15, color: NAVY }}>
                  How was this belief established?
                </div>
                <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                  Select the most accurate origin for this belief in your organisation.
                </div>

                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {([
                    { v: "direct" as Origin, label: "Direct experience", sub: "We observed this outcome in our own business" },
                    { v: "external" as Origin, label: "External reference", sub: "We adopted this from industry practice, a consultant, or a comparable company" },
                    { v: "inherited" as Origin, label: "Inherited assumption", sub: "It has always been true here. No one has verified the original source." },
                  ]).map(opt => {
                    const sel = origin === opt.v;
                    return (
                      <button
                        key={opt.v}
                        onClick={() => setOrigin(opt.v)}
                        style={{
                          textAlign: "left",
                          background: sel ? AMBER_LIGHT : "white",
                          border: sel ? `2px solid ${AMBER}` : `1px solid ${BORDER}`,
                          borderRadius: 10,
                          padding: "18px 20px",
                          cursor: "pointer",
                          display: "flex", gap: 14, alignItems: "flex-start",
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: `2px solid ${sel ? AMBER : "#CBD5E1"}`,
                          background: sel ? AMBER : "white",
                          flexShrink: 0, marginTop: 2,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {sel && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                        </span>
                        <span>
                          <div style={{ fontWeight: 500, fontSize: 15, color: NAVY }}>{opt.label}</div>
                          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{opt.sub}</div>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AmberButton disabled={!origin} onClick={() => setStage(2)}>Next: Classify →</AmberButton>
            </StageWrap>
          )}

          {stage === 2 && (
            <StageWrap num="02" name="Classify" sub="What kind of truth is this belief?">
              <ClassificationCard classification={classification} />
              <button
                onClick={() => setShowClassPicker(s => !s)}
                style={{ marginTop: 12, background: "transparent", border: "none", color: AMBER, fontSize: 13, cursor: "pointer", padding: 0 }}
              >
                Change classification
              </button>
              {showClassPicker && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(["STRUCTURALLY-TRUE", "PRECEDENT-TRUE", "ANALOGY-TRUE"] as Classification[]).map(c => (
                    <label key={c} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", border: `1px solid ${BORDER}`, borderRadius: 8, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="classification"
                        checked={classification === c}
                        onChange={() => setClassificationOverride(c)}
                        style={{ accentColor: AMBER }}
                      />
                      <span style={{ fontSize: 14, color: NAVY, fontWeight: 500 }}>{c}</span>
                    </label>
                  ))}
                </div>
              )}
              <AmberButton onClick={() => setStage(3)}>Next: Examine →</AmberButton>
            </StageWrap>
          )}

          {stage === 3 && (
            <StageWrap num="03" name="Examine" sub="The question your strongest critic would ask">
              <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Adversarial Question
              </div>
              <div style={{
                background: NAVY, color: "white",
                borderRadius: 12, padding: 32, marginTop: 8,
                fontSize: 18, fontStyle: "italic", lineHeight: 1.7,
              }}>
                "{beliefEntry!.counter}"
              </div>

              <div style={{ marginTop: 24, fontWeight: 500, fontSize: 15, color: NAVY }}>
                Your response
              </div>
              <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                Answer this question with your available evidence. The quality of your answer determines the verdict.
              </div>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="What evidence does your team have that directly addresses this question? Be specific — anecdotal answers do not constitute evidence."
                style={{
                  width: "100%", minHeight: 160, marginTop: 12,
                  background: "white", border: `1px solid rgba(217,119,6,0.3)`,
                  borderRadius: 10, padding: 16, fontSize: 16, color: NAVY,
                  fontFamily: "inherit", outline: "none", resize: "vertical",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(217,119,6,0.3)")}
              />
              <AmberButton onClick={() => setStage(4)}>Next: Verdict →</AmberButton>
            </StageWrap>
          )}

          {stage === 4 && (
            <StageWrap num="04" name="Verdict" sub="What survives the examination">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <VerdictCard
                  selected={verdict === "SURVIVE"}
                  onClick={() => setVerdict("SURVIVE")}
                  bg="#F0FDF4" border="#86EFAC" labelColor="#166534"
                  label="SURVIVE"
                  body="The belief holds under examination. The evidence supports its continued use as a basis for decision."
                  icon={<CheckCircle size={24} color="#22C55E" />}
                />
                <VerdictCard
                  selected={verdict === "SURVIVE_MODIFIED"}
                  onClick={() => setVerdict("SURVIVE_MODIFIED")}
                  bg={AMBER_LIGHT} border="#FCD34D" labelColor="#92400E"
                  label="SURVIVE — MODIFIED"
                  body="The belief holds with a stated revision. Specify the modification below."
                  icon={<RefreshCw size={24} color={AMBER} />}
                />
                <VerdictCard
                  selected={verdict === "FAIL"}
                  onClick={() => setVerdict("FAIL")}
                  bg="#FFF1F2" border="#FDA4AF" labelColor="#881337"
                  label="FAIL"
                  body="The belief does not hold. The intervention must change. Do not proceed on the original assumption."
                  icon={<XCircle size={24} color="#BE3455" />}
                />
                <VerdictCard
                  selected={verdict === "INDETERMINATE"}
                  onClick={() => setVerdict("INDETERMINATE")}
                  bg="#F8FAFC" border="#E2E8F0" labelColor="#475569"
                  label="INDETERMINATE"
                  body="Insufficient evidence to decide. The examination must continue with additional data before commitment."
                  icon={<HelpCircle size={24} color="#64748B" />}
                />
              </div>

              {verdict === "SURVIVE_MODIFIED" && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: NAVY }}>State the modification</div>
                  <textarea
                    value={modification}
                    onChange={(e) => setModification(e.target.value)}
                    placeholder="The belief survives but with this revision: ..."
                    style={{
                      width: "100%", minHeight: 100, marginTop: 8,
                      background: "white", border: `1px solid rgba(217,119,6,0.3)`,
                      borderRadius: 10, padding: 14, fontSize: 15, color: NAVY,
                      fontFamily: "inherit", outline: "none", resize: "vertical",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(217,119,6,0.3)")}
                  />
                </div>
              )}

              {verdict && (
                <ExaminationResults
                  pillar={pillar}
                  belief={beliefEntry!.belief}
                  classification={classification}
                  verdict={verdict}
                  modification={modification}
                  response={response}
                  hasScanContext={!!scanBinding}
                  navigate={navigate}
                />
              )}
            </StageWrap>
          )}
        </div>
      </main>
    </Shell>
  );
}

// ----- Shell with nav + header -----
function Shell({ children, scanBinding, pillarName }: { children: React.ReactNode; scanBinding: ScanBinding | null; pillarName?: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "white", color: NAVY, fontFamily: "Inter, sans-serif" }}>
      <ZeroNav />
      <PageHeader scanBinding={scanBinding} pillarName={pillarName} />
      <div style={{ paddingTop: 0 }}>{children}</div>
    </div>
  );
}

function ZeroNav() {
  const links = [
    { label: "Pulse", to: "/pulse" },
    { label: "Scan", to: "/scan" },
    { label: "ZERO", to: "/zero", active: true },
    { label: "SNAG", to: "/analyze" },
  ];
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      height: 64, background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", height: "100%", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <span style={{ fontWeight: 300, fontSize: 18, color: NAVY, letterSpacing: "-0.02em" }}>nerve</span>
          <span style={{ width: 1, height: 16, background: BORDER }} />
          <span style={{ fontSize: 13, color: "#64748B" }}>by Roarr</span>
        </Link>
        <div style={{ display: "flex", gap: 28 }}>
          {links.map(l => (
            <Link key={l.label} to={l.to} style={{
              fontSize: 14,
              color: l.active ? AMBER : NAVY,
              fontWeight: l.active ? 600 : 500,
              textDecoration: "none",
            }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function PageHeader({ scanBinding, pillarName }: { scanBinding: ScanBinding | null; pillarName?: string }) {
  return (
    <div style={{
      background: AMBER_LIGHT,
      borderBottom: `1px solid rgba(217,119,6,0.15)`,
      padding: "24px 32px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span style={{
            background: AMBER, color: "white", fontWeight: 600,
            fontSize: 11, padding: "4px 12px", borderRadius: 980,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>ZERO</span>
          <div style={{ marginTop: 8, fontSize: 13, color: AMBER_DARK, fontWeight: 400 }}>
            Belief Examination
          </div>
        </div>
        {scanBinding && pillarName && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#78350F", opacity: 0.7 }}>Examining constraint from</div>
            <div style={{ color: AMBER, fontWeight: 500, fontSize: 14, marginTop: 2 }}>{pillarName}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function StageWrap({ num, name, sub, children }: { num: string; name: string; sub: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <span style={{
          background: AMBER, color: "white", fontWeight: 600, fontSize: 11,
          padding: "4px 10px", borderRadius: 980,
        }}>{num}</span>
        <span style={{ fontWeight: 500, fontSize: 20, color: NAVY }}>{name}</span>
      </div>
      <div style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>{sub}</div>
      {children}
    </section>
  );
}

function AmberButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        marginTop: 28,
        background: disabled ? "#E5E7EB" : AMBER,
        color: disabled ? "#94A3B8" : "white",
        border: "none", padding: "12px 24px",
        borderRadius: 980, fontSize: 14, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = AMBER_HOVER; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = AMBER; }}
    >
      {children}
    </button>
  );
}

function ClassificationCard({ classification }: { classification: Classification }) {
  const map: Record<Classification, { bg: string; border: string; color: string; body: string }> = {
    "STRUCTURALLY-TRUE": {
      bg: "#F0FDF4", border: "#86EFAC", color: "#166534",
      body: "This belief has an articulable mechanism that holds independent of historical precedent. It is the most defensible classification — but that does not mean it is immune to examination.",
    },
    "PRECEDENT-TRUE": {
      bg: AMBER_LIGHT, border: "#FCD34D", color: "#92400E",
      body: "This belief is supported by past experience, but its mechanism — why it must continue to be true — is not articulated. It survives as long as conditions match the original context. Most revenue beliefs fall here.",
    },
    "ANALOGY-TRUE": {
      bg: "#FFF1F2", border: "#FDA4AF", color: "#881337",
      body: "This belief is held because a comparable organisation or situation holds it. The mechanism by which it transfers to your context has not been verified. This is the most fragile classification.",
    },
  };
  const c = map[classification];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: c.color, letterSpacing: "0.06em" }}>{classification}</div>
      <p style={{ fontSize: 15, color: NAVY, marginTop: 12, lineHeight: 1.6 }}>{c.body}</p>
    </div>
  );
}

function VerdictCard({ selected, onClick, bg, border, labelColor, label, body, icon }: {
  selected: boolean; onClick: () => void; bg: string; border: string; labelColor: string;
  label: string; body: string; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", cursor: "pointer",
        background: bg,
        border: selected ? `2px solid ${border}` : `1px solid ${border}`,
        borderRadius: 12, padding: 20,
        boxShadow: selected ? `0 0 0 3px ${border}33` : "none",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: labelColor, letterSpacing: "0.06em" }}>{label}</span>
        {icon}
      </div>
      <p style={{ fontSize: 14, color: NAVY, marginTop: 12, lineHeight: 1.5 }}>{body}</p>
    </button>
  );
}

function ExaminationResults({
  pillar, belief, classification, verdict, modification, response, hasScanContext, navigate,
}: {
  pillar: { id: number; name: string };
  belief: string;
  classification: Classification;
  verdict: Verdict;
  modification: string;
  response: string;
  hasScanContext: boolean;
  navigate: (to: string) => void;
}) {
  const verdictLabelMap: Record<Verdict, { label: string; color: string }> = {
    SURVIVE: { label: "SURVIVE", color: "#166534" },
    SURVIVE_MODIFIED: { label: "SURVIVE — MODIFIED", color: "#92400E" },
    FAIL: { label: "FAIL", color: "#881337" },
    INDETERMINATE: { label: "INDETERMINATE", color: "#475569" },
  };
  const classColor: Record<Classification, string> = {
    "STRUCTURALLY-TRUE": "#166534",
    "PRECEDENT-TRUE": "#92400E",
    "ANALOGY-TRUE": "#881337",
  };
  const meansMap: Record<Verdict, string> = {
    SURVIVE: "The belief holds. Proceed with your current intervention strategy. Monitor the tolerance bands specified at deployment.",
    SURVIVE_MODIFIED: "The belief holds with revision. Update your intervention to reflect the stated modification before committing resources.",
    FAIL: "The belief does not hold. The current intervention is built on a failing foundation. Gate this decision through SNAG before committing. Do not proceed on the original plan.",
    INDETERMINATE: "The examination is incomplete. Identify the data that would resolve the uncertainty and re-examine before committing resources.",
  };

  const truncBelief = belief.length > 100 ? belief.slice(0, 97) + "…" : belief;

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{
        background: AMBER_LIGHT,
        border: `1px solid rgba(217,119,6,0.3)`,
        borderRadius: 12,
        padding: 32,
      }}>
        <div style={{
          fontWeight: 700, fontSize: 11, color: AMBER,
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>Examination Complete</div>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <Row label="Pillar examined" value={pillar.name} />
          <Row label="Load-bearing belief" value={truncBelief} />
          <Row label="Classification" value={classification} valueColor={classColor[classification]} />
          <Row
            label="Verdict"
            value={verdictLabelMap[verdict].label + (verdict === "SURVIVE_MODIFIED" && modification ? ` — ${modification}` : "")}
            valueColor={verdictLabelMap[verdict].color}
          />
        </div>

        <div style={{ marginTop: 24, fontWeight: 600, fontSize: 13, color: AMBER_DARK, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          What this means
        </div>
        <p style={{ fontSize: 15, color: NAVY, marginTop: 8, lineHeight: 1.6 }}>{meansMap[verdict]}</p>
      </div>

      {/* Next steps */}
      <div style={{
        marginTop: 32,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
      }}>
        <NextCard
          modPill={{ label: "SNAG", bg: "#BE3455" }}
          title="Gate the intervention"
          body="Before committing resources based on this examination, run SNAG. Surface the assumption. Set the kill criterion."
          cta="Open SNAG →"
          onClick={() => {
            sessionStorage.setItem("snag_prefill", JSON.stringify({
              source: "zero",
              pillar: pillar.name,
              verdict: verdictLabelMap[verdict].label,
              belief,
              context: `ZERO examination of ${pillar.name} returned verdict: ${verdictLabelMap[verdict].label}. Belief examined: ${belief}. Response to adversarial question: ${response || "(none provided)"}`,
            }));
            navigate("/analyze");
          }}
        />
        {hasScanContext ? (
          <NextCard
            modPill={{ label: "SCAN", bg: "#0047AB" }}
            title="Return to your Scan results"
            body={`Your Scan identified ${pillar.name} as the binding constraint. View the full diagnostic and financial impact.`}
            cta="View Scan results →"
            onClick={() => navigate("/scan/results")}
          />
        ) : (
          <NextCard
            modPill={{ label: "SCAN", bg: "#0047AB" }}
            title="Run the full diagnostic"
            body="ZERO examined one belief. Scan scores all eight pillars and identifies every constraint in your revenue system."
            cta="Run Scan →"
            onClick={() => navigate("/scan")}
          />
        )}
        <NextCard
          modPill={{ label: "NERVE", bg: NAVY }}
          title="Work with Mahesh directly"
          body="A full Revenue Integrity engagement applies ZERO across all eight pillars with your live pipeline data."
          cta="Book 20 minutes →"
          onClick={() => window.open(CALENDLY_URL, "_blank")}
        />
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 12, color: AMBER_DARK, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 15, color: valueColor ?? NAVY, fontWeight: valueColor ? 600 : 500 }}>{value}</span>
    </div>
  );
}

function NextCard({ modPill, title, body, cta, onClick }: {
  modPill: { label: string; bg: string };
  title: string; body: string; cta: string; onClick: () => void;
}) {
  return (
    <div style={{
      background: "white", border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: 24, display: "flex", flexDirection: "column", gap: 12,
    }}>
      <span style={{
        alignSelf: "flex-start",
        background: modPill.bg, color: "white", fontSize: 10,
        fontWeight: 700, letterSpacing: "0.08em", padding: "3px 10px",
        borderRadius: 980, textTransform: "uppercase",
      }}>{modPill.label}</span>
      <div style={{ fontWeight: 500, fontSize: 17, color: NAVY }}>{title}</div>
      <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, flex: 1, margin: 0 }}>{body}</p>
      <button
        onClick={onClick}
        style={{
          alignSelf: "flex-start",
          background: AMBER, color: "white", border: "none",
          padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = AMBER_HOVER)}
        onMouseLeave={(e) => (e.currentTarget.style.background = AMBER)}
      >
        {cta}
      </button>
    </div>
  );
}
