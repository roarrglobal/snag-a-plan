import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MODULE_META, submitIntakeForm, type NerveModule } from "@/lib/nerveAccess";
import { useToast } from "@/hooks/use-toast";

const ARR_OPTIONS = ["Pre-revenue", "Under $1M", "$1M–$10M", "$10M–$50M", "$50M+"];
const MODULES: NerveModule[] = ["pulse", "scan", "zero", "snag"];

interface Props {
  defaultModule?: NerveModule;
  onSubmitted?: () => void;
}

export function IntakeForm({ defaultModule, onSubmitted }: Props) {
  const { user, nerveProfile, refreshNerveAccess } = useAuth();
  const { toast } = useToast();
  const [situation, setSituation] = useState("");
  const [arr, setArr] = useState<string | null>(null);
  const [modules, setModules] = useState<NerveModule[]>(defaultModule ? [defaultModule] : []);
  const [howFound, setHowFound] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const color = defaultModule ? MODULE_META[defaultModule].color : "#0047AB";

  const toggle = (m: NerveModule) =>
    setModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (situation.trim().length < 10) {
      toast({ title: "Please describe your situation in more detail.", variant: "destructive" });
      return;
    }
    if (!arr) {
      toast({ title: "Select an ARR range.", variant: "destructive" });
      return;
    }
    const requested = modules.length ? modules : defaultModule ? [defaultModule] : [];

    setSubmitting(true);
    try {
      const { error } = await submitIntakeForm({
        user_id: user.id,
        modules_requested: requested,
        current_situation: situation,
        company_arr: arr,
        how_found: howFound || null,
      });
      if (error) {
        toast({ title: "Submission failed", description: error.message, variant: "destructive" });
        return;
      }

      // Fire-and-forget admin notification
      try {
        await supabase.functions.invoke("nerve-admin-notification", {
          body: {
            user_id: user.id,
            email: user.email,
            full_name: nerveProfile?.full_name || user.user_metadata?.full_name,
            company_name: nerveProfile?.company_name || user.user_metadata?.company_name,
            module: defaultModule ?? requested[0],
            modules_requested: requested,
            company_arr: arr,
            how_found: howFound || null,
            current_situation: situation,
          },
        });
      } catch (err) {
        console.warn("admin notification failed", err);
      }

      await refreshNerveAccess();
      toast({ title: "Intake submitted. We'll be in touch within 24 hours." });
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          What problem are you trying to solve?
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          required
          rows={5}
          placeholder="e.g. We have missed the last two quarters. Pipeline looks healthy but deals are not closing. We cannot explain why."
          className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Roughly, what is your current ARR?
        </label>
        <div className="flex flex-wrap gap-2">
          {ARR_OPTIONS.map((opt) => {
            const active = arr === opt;
            return (
              <button
                type="button"
                key={opt}
                onClick={() => setArr(opt)}
                className="px-3.5 py-2 rounded-full text-sm font-medium transition"
                style={{
                  border: `1px solid ${active ? color : "rgba(0,0,0,0.15)"}`,
                  background: active ? `${color}1a` : "transparent",
                  color: active ? color : "#374151",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Which modules are you most interested in?
        </label>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((m) => {
            const active = modules.includes(m);
            const meta = MODULE_META[m];
            return (
              <button
                type="button"
                key={m}
                onClick={() => toggle(m)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition"
                style={{
                  border: `1px solid ${active ? meta.color : "rgba(0,0,0,0.15)"}`,
                  background: active ? `${meta.color}1a` : "transparent",
                  color: active ? meta.color : "#6B7280",
                  letterSpacing: "0.08em",
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">How did you find Nerve?</label>
        <input
          value={howFound}
          onChange={(e) => setHowFound(e.target.value)}
          placeholder="LinkedIn, The Revenue Circle newsletter, referral, etc."
          className="w-full px-3 py-2.5 rounded-md border text-sm bg-background"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-md font-medium text-white transition disabled:opacity-60"
        style={{ background: color }}
      >
        {submitting ? "Submitting..." : "Submit →"}
      </button>
    </form>
  );
}
