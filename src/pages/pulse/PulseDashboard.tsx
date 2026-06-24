import { MODULE_META } from "@/lib/nerveAccess";

export default function PulseDashboard() {
  const meta = MODULE_META.pulse;
  return (
    <div className="min-h-screen bg-white px-8 py-20">
      <div className="max-w-[720px] mx-auto text-center">
        <span
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6"
          style={{ color: meta.color, border: `1px solid ${meta.color}40`, background: meta.light }}
        >
          {meta.label}
        </span>
        <h1 className="text-[40px] font-light leading-tight" style={{ color: "#0A1628" }}>
          Pulse workspace coming soon.
        </h1>
        <p className="mt-5 text-[16px] text-[#6B7280] max-w-[480px] mx-auto leading-relaxed">
          {meta.description}
        </p>
      </div>
    </div>
  );
}
