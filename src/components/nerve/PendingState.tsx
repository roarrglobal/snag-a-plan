import { Clock, Check } from "lucide-react";
import { MODULE_META, type NerveModule } from "@/lib/nerveAccess";

interface Props {
  module: NerveModule;
  intakeScheduled?: boolean;
}

export function PendingState({ module, intakeScheduled }: Props) {
  const meta = MODULE_META[module];
  const step2Active = !!intakeScheduled;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-8 py-20">
      <div className="w-full max-w-[560px] text-center">
        <span
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-8"
          style={{
            color: meta.color,
            border: `1px solid ${meta.color}40`,
            background: meta.light,
          }}
        >
          {meta.label}
        </span>

        <div className="flex justify-center mb-6">
          <Clock size={48} style={{ color: meta.color }} strokeWidth={1.5} />
        </div>

        <h1 className="text-[32px] font-light leading-tight" style={{ color: "#0A1628" }}>
          Your access request is being reviewed.
        </h1>

        <p className="mt-5 text-[16px] text-[#6B7280] max-w-[400px] mx-auto leading-relaxed">
          {intakeScheduled
            ? "Your intake call is scheduled. Check your email for the calendar link."
            : "We review every request personally. You will receive an email within 24 hours to schedule a brief intake conversation."}
        </p>

        {/* Status tracker */}
        <div className="mt-12 flex items-center justify-between gap-3">
          <Step label="Request submitted" complete color={meta.color} />
          <Divider />
          <Step label="Intake conversation" active={step2Active} color={meta.color} />
          <Divider />
          <Step label="Access activated" color={meta.color} />
        </div>

        <div className="mt-14 pt-8 border-t border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-2">While you wait, explore</p>
          <a
            href="https://www.linkedin.com/newsletters/the-revenue-circle-7239797128566693888/"
            target="_blank"
            rel="noreferrer"
            className="text-[15px] font-medium underline-offset-4 hover:underline"
            style={{ color: meta.color }}
          >
            The Revenue Circle — 2,247 subscribers →
          </a>
        </div>
      </div>
    </div>
  );
}

function Step({ label, complete, active, color }: { label: string; complete?: boolean; active?: boolean; color: string }) {
  const dotColor = complete ? color : active ? color : "#D1D5DB";
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
        style={{ background: dotColor }}
      >
        {complete ? <Check size={14} /> : "•"}
      </div>
      <span className="text-[11px] text-center text-[#6B7280] leading-tight">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px flex-1 bg-[#E5E7EB] -mt-5" />;
}
