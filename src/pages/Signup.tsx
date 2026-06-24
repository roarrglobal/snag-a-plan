import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Radar, Shield, Compass, Activity, ArrowLeft, type LucideIcon } from "lucide-react";

const NAVY = "#0A1628";
const COBALT = "#0047AB";
const SUBTLE = "rgba(255,255,255,0.6)";
const BORDER = "rgba(0,71,171,0.2)";
const CARD = "rgba(255,255,255,0.03)";

type ModuleKey = "scan" | "snag" | "zero" | "pulse";

interface ModuleDef {
  key: ModuleKey;
  tag: string;
  Icon: LucideIcon;
  headline: string;
  body: string;
  pill: string;
  route: string;
  disabled?: boolean;
}

const MODULES: ModuleDef[] = [
  {
    key: "scan",
    tag: "SCAN",
    Icon: Radar,
    headline: "Find the break in my revenue system",
    body: "Eight-pillar diagnostic. Identifies the single constraint costing you the most.",
    pill: "20 minutes · Free",
    route: "/scan",
  },
  {
    key: "snag",
    tag: "SNAG",
    Icon: Shield,
    headline: "Gate a major revenue decision",
    body: "Pre-commitment pre-mortem. Surface the assumption. Set the kill criterion.",
    pill: "Team decision gate",
    route: "/analyze",
  },
  {
    key: "zero",
    tag: "ZERO",
    Icon: Compass,
    headline: "Examine the belief driving our problem",
    body: "First-principles belief examination. Surface what your team is assuming and whether it holds.",
    pill: "Reasoning engine",
    route: "/zero",
  },
  {
    key: "pulse",
    tag: "PULSE",
    Icon: Activity,
    headline: "Monitor our pipeline execution daily",
    body: "CRM hygiene, deal health, execution decay alerts. Continuous revenue monitoring.",
    pill: "Coming soon",
    route: "/dashboard",
    disabled: true,
  },
];

const TEAM_SIZES = ["Just me", "2–10", "11–50", "50+"];

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<ModuleKey | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [teamSize, setTeamSize] = useState<string>("Just me");
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const mod = (localStorage.getItem("nerve_onboarding_module") as ModuleKey) || "scan";
      const route = MODULES.find((m) => m.key === mod)?.route || "/dashboard";
      navigate(route, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const selectedModule = MODULES.find((m) => m.key === selected);

  const handleContinue = () => {
    if (!selected) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!agree) {
      toast({ title: "Please accept the Terms to continue", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const userType = teamSize === "Just me" ? "individual" : "business";
      const { error } = await signUp(email, password, fullName, userType, company || undefined);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        return;
      }

      // Persist onboarding choices
      localStorage.setItem("nerve_onboarding_module", selected);
      localStorage.setItem(
        "nerve_onboarding",
        JSON.stringify({ module: selected, company_name: company, team_size: teamSize })
      );

      // Best-effort: stamp metadata if a session exists
      try {
        await supabase.auth.updateUser({
          data: {
            selected_module: selected,
            company_name: company,
            team_size: teamSize,
          },
        });
      } catch {
        // ignore — user may need to verify email first
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const route = selectedModule?.route || "/dashboard";

      if (sessionData?.session) {
        navigate(route, { replace: true });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link to finish setup.",
          duration: 10000,
        });
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: NAVY,
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-baseline gap-2 mb-10">
          <span style={{ fontWeight: 300, fontSize: 24, letterSpacing: "-0.02em" }}>nerve</span>
        </Link>

        {step === 1 ? (
          <StepOne
            selected={selected}
            setSelected={setSelected}
            onContinue={handleContinue}
          />
        ) : (
          <StepTwo
            selected={selected!}
            selectedModule={selectedModule!}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            company={company}
            setCompany={setCompany}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            teamSize={teamSize}
            setTeamSize={setTeamSize}
            agree={agree}
            setAgree={setAgree}
            isLoading={isLoading}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
          />
        )}

        <p style={{ color: SUBTLE, fontSize: 12, textAlign: "center", marginTop: 48 }}>
          Built on The Revenue Circle System™ — 120+ diagnostic engagements across B2B revenue teams
        </p>
        <p style={{ color: SUBTLE, fontSize: 13, textAlign: "center", marginTop: 12 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: COBALT, fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function StepOne({
  selected,
  setSelected,
  onContinue,
}: {
  selected: ModuleKey | null;
  setSelected: (m: ModuleKey) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div style={{ color: COBALT, fontSize: 11, letterSpacing: "0.2em", fontWeight: 500, textTransform: "uppercase" }}>
        Welcome to Nerve
      </div>
      <h1 style={{ fontWeight: 300, fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em", lineHeight: 1.2, marginTop: 12 }}>
        What brings you here?
      </h1>
      <p style={{ color: SUBTLE, marginTop: 12, fontSize: 15 }}>
        We'll set up your workspace based on where you want to start.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
        {MODULES.map((m) => {
          const isSelected = selected === m.key;
          const disabled = m.disabled;
          return (
            <button
              key={m.key}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setSelected(m.key)}
              title={disabled ? "Pulse launches soon. Select another module to get started." : undefined}
              style={{
                position: "relative",
                textAlign: "left",
                padding: 24,
                borderRadius: 10,
                border: isSelected ? `2px solid ${COBALT}` : `1px solid ${BORDER}`,
                background: isSelected ? "rgba(0,71,171,0.1)" : CARD,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "all 150ms",
                color: "white",
              }}
            >
              {isSelected && (
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: COBALT,
                    color: "white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={14} />
                </span>
              )}
              <div style={{ color: COBALT, fontSize: 11, letterSpacing: "0.2em", fontWeight: 600 }}>{m.tag}</div>
              <div style={{ marginTop: 12, color: COBALT }}>
                <m.Icon size={28} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 500, marginTop: 14, lineHeight: 1.35 }}>{m.headline}</h3>
              <p style={{ color: SUBTLE, fontSize: 13.5, lineHeight: 1.55, marginTop: 10 }}>{m.body}</p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  border: `1px solid ${COBALT}`,
                  color: COBALT,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontWeight: 500,
                }}
              >
                {m.pill}
              </span>
            </button>
          );
        })}
      </div>

      <p style={{ color: SUBTLE, fontSize: 12.5, textAlign: "center", marginTop: 24 }}>
        You can access all modules after signup. This just sets your starting point.
      </p>

      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selected}
          style={{
            background: COBALT,
            color: "white",
            border: "none",
            padding: "13px 24px",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 15,
            cursor: selected ? "pointer" : "not-allowed",
            opacity: selected ? 1 : 0.4,
            width: "100%",
            maxWidth: 400,
          }}
        >
          Continue →
        </button>
      </div>
    </>
  );
}

function StepTwo(props: {
  selected: ModuleKey;
  selectedModule: ModuleDef;
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  teamSize: string;
  setTeamSize: (v: string) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const { selectedModule } = props;
  return (
    <div className="max-w-lg mx-auto">
      <button
        type="button"
        onClick={props.onBack}
        style={{ color: SUBTLE, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer" }}
      >
        <ArrowLeft size={14} /> Change selection
      </button>

      <div className="mt-4">
        <span
          style={{
            display: "inline-block",
            border: `1px solid ${COBALT}`,
            color: COBALT,
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 500,
            letterSpacing: "0.06em",
          }}
        >
          Starting with: {selectedModule.tag}
        </span>
      </div>

      <h2 style={{ fontWeight: 300, fontSize: "clamp(26px, 3.5vw, 36px)", letterSpacing: "-0.02em", lineHeight: 1.2, marginTop: 20 }}>
        Create your account
      </h2>

      <form onSubmit={props.onSubmit} className="space-y-4 mt-8">
        <Field label="Full name" value={props.fullName} onChange={props.setFullName} required />
        <Field label="Work email" type="email" value={props.email} onChange={props.setEmail} required />
        <Field label="Company name" value={props.company} onChange={props.setCompany} required />
        <Field label="Password" type="password" value={props.password} onChange={props.setPassword} required minLength={8} helper="8+ characters" />
        <Field label="Confirm password" type="password" value={props.confirmPassword} onChange={props.setConfirmPassword} required minLength={8} />

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Team size</label>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZES.map((s) => {
              const active = props.teamSize === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => props.setTeamSize(s)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    border: active ? `2px solid ${COBALT}` : `1px solid ${BORDER}`,
                    background: active ? "rgba(0,71,171,0.15)" : "transparent",
                    color: active ? "white" : SUBTLE,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: SUBTLE, marginTop: 12 }}>
          <input
            type="checkbox"
            checked={props.agree}
            onChange={(e) => props.setAgree(e.target.checked)}
            style={{ marginTop: 3, accentColor: COBALT }}
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" style={{ color: COBALT }}>Terms of Service</Link> and{" "}
            <Link to="/privacy" style={{ color: COBALT }}>Privacy Policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          disabled={props.isLoading}
          style={{
            width: "100%",
            background: COBALT,
            color: "white",
            border: "none",
            padding: "13px 20px",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 15,
            cursor: props.isLoading ? "not-allowed" : "pointer",
            opacity: props.isLoading ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {props.isLoading ? "Creating account..." : "Create my account →"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  helper?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full px-3 py-2.5 rounded-md outline-none"
        style={{
          background: "transparent",
          border: `1px solid rgba(0,71,171,0.5)`,
          color: "white",
          fontSize: 14,
        }}
      />
      {helper && <p style={{ color: SUBTLE, fontSize: 11.5, marginTop: 4 }}>{helper}</p>}
    </div>
  );
}
