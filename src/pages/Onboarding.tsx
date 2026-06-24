import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { IntakeForm } from "@/components/nerve/IntakeForm";
import { Check } from "lucide-react";
import type { NerveModule } from "@/lib/nerveAccess";

export default function Onboarding() {
  const { user, isLoading, nerveProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user already has an intake on file, send to pending.
    // We can't directly check intake table here cheaply — rely on onboarding_status.
    if (nerveProfile?.onboarding_status && nerveProfile.onboarding_status !== "pending_review") {
      navigate("/pending", { replace: true });
    }
  }, [nerveProfile, navigate]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login?redirect=/onboarding" replace />;

  const defaultModule = (nerveProfile?.primary_module ?? "scan") as NerveModule;

  return (
    <div className="min-h-screen bg-white px-8 py-16">
      <div className="max-w-[640px] mx-auto">
        <Steps current={2} />
        <h1 className="text-[32px] font-light mt-10 mb-2" style={{ color: "#0A1628" }}>
          Tell us your situation
        </h1>
        <p className="text-[#6B7280] mb-10">
          This takes 2 minutes. It helps us prepare for your intake conversation and activate the
          right modules for your team.
        </p>
        <IntakeForm
          defaultModule={defaultModule}
          onSubmitted={() => navigate("/pending", { replace: true })}
        />
      </div>
    </div>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const items = ["Account created", "Tell us your situation", "Access activated"];
  return (
    <div className="flex items-center gap-2">
      {items.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const complete = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ background: complete || active ? "#0047AB" : "#D1D5DB" }}
            >
              {complete ? <Check size={12} /> : step}
            </div>
            <span className={`text-xs ${active ? "text-foreground font-medium" : "text-[#6B7280]"}`}>
              {label}
            </span>
            {i < items.length - 1 && <div className="h-px flex-1 bg-[#E5E7EB] mx-1" />}
          </div>
        );
      })}
    </div>
  );
}
