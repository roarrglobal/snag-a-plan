import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MODULE_META, requestModuleAccess, type NerveModule } from "@/lib/nerveAccess";
import { PendingState } from "@/components/nerve/PendingState";
import { IntakeForm } from "@/components/nerve/IntakeForm";
import { useToast } from "@/hooks/use-toast";

interface Props {
  module: NerveModule;
  children: ReactNode;
}

export function ModuleAccessGuard({ module, children }: Props) {
  const { user, isLoading, moduleStatus, refreshNerveAccess } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);
  const [showIntake, setShowIntake] = useState(false);

  const meta = MODULE_META[module];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: meta.color }}
        />
      </div>
    );
  }

  // Unauthenticated: inline gate
  if (!user) {
    return <UnauthGate module={module} redirect={location.pathname} />;
  }

  const status = moduleStatus(module);

  if (status === "active" || status === "trial") {
    return <>{children}</>;
  }

  if (status === "requested" || status === "pending_intake") {
    return <PendingState module={module} intakeScheduled={status === "pending_intake"} />;
  }

  if (status === "suspended") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-8 py-20">
        <div className="max-w-[480px] text-center">
          <h1 className="text-[28px] font-light" style={{ color: "#0A1628" }}>
            Your access to {meta.label} has been suspended.
          </h1>
          <p className="mt-4 text-[#6B7280]">
            Reach out to{" "}
            <a href="mailto:mahesh@roarrglobal.com" style={{ color: meta.color }} className="underline">
              mahesh@roarrglobal.com
            </a>{" "}
            to discuss.
          </p>
        </div>
      </div>
    );
  }

  // No row yet — request access
  const handleRequest = async () => {
    if (!user) return;
    setRequesting(true);
    try {
      const { error } = await requestModuleAccess(user.id, module);
      if (error && !`${error.message}`.includes("duplicate")) {
        toast({ title: "Could not submit request", description: error.message, variant: "destructive" });
        return;
      }
      await refreshNerveAccess();
      setShowIntake(true);
    } finally {
      setRequesting(false);
    }
  };

  if (showIntake) {
    return (
      <div className="min-h-screen bg-white px-8 py-16">
        <div className="max-w-[640px] mx-auto">
          <h1 className="text-[28px] font-light mb-2" style={{ color: "#0A1628" }}>
            Tell us about your situation
          </h1>
          <p className="text-[#6B7280] mb-8">
            This takes 2 minutes. It helps us prepare for your intake conversation and activate the right
            modules for your team.
          </p>
          <IntakeForm
            defaultModule={module}
            onSubmitted={async () => {
              await refreshNerveAccess();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-8 py-20">
      <div className="w-full max-w-[560px] text-center">
        <span
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6"
          style={{ color: meta.color, border: `1px solid ${meta.color}40`, background: meta.light }}
        >
          {meta.label}
        </span>
        <h1 className="text-[32px] font-light leading-tight" style={{ color: "#0A1628" }}>
          Request access to {meta.label}
        </h1>
        <p className="mt-5 text-[16px] text-[#6B7280] max-w-[420px] mx-auto leading-relaxed">
          {meta.description}
        </p>
        <button
          onClick={handleRequest}
          disabled={requesting}
          className="mt-10 px-7 py-3 rounded-md font-medium text-white transition disabled:opacity-60"
          style={{ background: meta.color }}
        >
          {requesting ? "Submitting..." : "Request access →"}
        </button>
      </div>
    </div>
  );
}

function UnauthGate({ module, redirect }: { module: NerveModule; redirect: string }) {
  const meta = MODULE_META[module];
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-8 py-20">
      <div className="w-full max-w-[560px] text-center">
        <span
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6"
          style={{ color: meta.color, border: `1px solid ${meta.color}40`, background: meta.light }}
        >
          {meta.label}
        </span>
        <h1 className="text-[32px] font-light leading-tight" style={{ color: "#0A1628" }}>
          {meta.label} is part of Nerve.
        </h1>
        <p className="mt-5 text-[16px] text-[#6B7280] max-w-[420px] mx-auto leading-relaxed">
          {meta.description}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="px-6 py-3 rounded-md font-medium text-white"
            style={{ background: meta.color }}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="px-6 py-3 rounded-md font-medium border"
            style={{ borderColor: meta.color, color: meta.color }}
          >
            Create a Nerve account
          </Link>
        </div>
      </div>
    </div>
  );
}
