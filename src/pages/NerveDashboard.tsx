import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, ScanLine, CircleDashed, Radar } from "lucide-react";
import { MODULE_META, type NerveModule } from "@/lib/nerveAccess";
import { ActiveGatesWidget } from "@/components/dashboard/ActiveGatesWidget";
import { formatDistanceToNow } from "date-fns";

const ICONS: Record<NerveModule, JSX.Element> = {
  pulse: <Radar className="w-4 h-4" />,
  scan: <ScanLine className="w-4 h-4" />,
  zero: <CircleDashed className="w-4 h-4" />,
  snag: <ShieldCheck className="w-4 h-4" />,
};

function ModulePill({ module }: { module: NerveModule }) {
  const meta = MODULE_META[module];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: meta.light, color: meta.color }}
    >
      {ICONS[module]}
      {meta.label}
    </span>
  );
}

function WidgetCard({
  module,
  viewAllHref,
  viewAllLabel,
  children,
}: {
  module: NerveModule;
  viewAllHref: string;
  viewAllLabel: string;
  children: React.ReactNode;
}) {
  const meta = MODULE_META[module];
  return (
    <Card className="border-l-4" style={{ borderLeftColor: meta.color }}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <ModulePill module={module} />
        <Link
          to={viewAllHref}
          className="text-xs font-medium hover:underline"
          style={{ color: meta.color }}
        >
          {viewAllLabel} →
        </Link>
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}

// ---------------- SCAN widget ----------------
function ScanWidget() {
  const { user } = useAuth();
  const [latest, setLatest] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("scan_sessions")
        .select("id, binding_constraint, status, completed, created_at")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatest(data ?? null);
    })();
  }, [user]);

  const scoreColor = (s?: number) => {
    if (!s && s !== 0) return { bg: "#F3F4F6", fg: "#6B7280" };
    if (s <= 10) return { bg: "#FEE2E2", fg: "#991B1B" };
    if (s <= 15) return { bg: "#FEF3C7", fg: "#92400E" };
    return { bg: "#DCFCE7", fg: "#166534" };
  };

  return (
    <WidgetCard module="scan" viewAllHref="/scan" viewAllLabel="View all">
      {latest === undefined ? (
        <div className="h-16 animate-pulse bg-muted rounded" />
      ) : latest === null ? (
        <Link to="/scan/new" className="block hover:underline" style={{ color: MODULE_META.scan.color }}>
          No scans yet. Run your first diagnostic →
        </Link>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Binding constraint</p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-foreground">
                {latest.binding_constraint?.pillar_name ?? "—"}
              </span>
              {typeof latest.binding_constraint?.score === "number" && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{
                    background: scoreColor(latest.binding_constraint.score).bg,
                    color: scoreColor(latest.binding_constraint.score).fg,
                  }}
                >
                  {latest.binding_constraint.score}/25
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}
            </p>
          </div>
          <Link
            to="/scan/new"
            className="inline-block text-xs font-medium hover:underline"
            style={{ color: MODULE_META.scan.color }}
          >
            Run a new Scan →
          </Link>
        </div>
      )}
    </WidgetCard>
  );
}

// ---------------- ZERO widget ----------------
const verdictBadge = (v: string | null | undefined) => {
  switch (v) {
    case "proceed":
      return { label: "PROCEED", bg: "#DCFCE7", fg: "#166534" };
    case "do_not_proceed":
      return { label: "DO NOT PROCEED", bg: "#FEE2E2", fg: "#991B1B" };
    case "proceed_modified":
      return { label: "PROCEED MODIFIED", bg: "#FEF3C7", fg: "#92400E" };
    case "insufficient_evidence":
      return { label: "INSUFFICIENT", bg: "#E0E7FF", fg: "#3730A3" };
    default:
      return { label: "IN PROGRESS", bg: "#F3F4F6", fg: "#6B7280" };
  }
};

function ZeroWidget() {
  const { user } = useAuth();
  const [latest, setLatest] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("zero_sessions")
        .select("id, decision_text, overall_verdict, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatest(data ?? null);
    })();
  }, [user]);

  return (
    <WidgetCard module="zero" viewAllHref="/zero" viewAllLabel="View all">
      {latest === undefined ? (
        <div className="h-16 animate-pulse bg-muted rounded" />
      ) : latest === null ? (
        <Link to="/zero/new" className="block hover:underline" style={{ color: MODULE_META.zero.color }}>
          No examinations yet. Start one →
        </Link>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Topic examined</p>
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-foreground line-clamp-2 flex-1">
                {latest.decision_text || "Untitled examination"}
              </span>
              {(() => {
                const v = verdictBadge(latest.overall_verdict);
                return (
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
                    style={{ background: v.bg, color: v.fg }}
                  >
                    {v.label}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}
            </p>
          </div>
          <Link
            to="/zero/new"
            className="inline-block text-xs font-medium hover:underline"
            style={{ color: MODULE_META.zero.color }}
          >
            Start new examination →
          </Link>
        </div>
      )}
    </WidgetCard>
  );
}

// ---------------- SNAG widget ----------------
function SnagWidget() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ active: number; fired: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [a, f] = await Promise.all([
        (supabase as any)
          .from("analyses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("gate_status", "active"),
        (supabase as any)
          .from("analyses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("gate_status", "fired"),
      ]);
      setStats({ active: a.count || 0, fired: f.count || 0 });
    })();
  }, [user]);

  return (
    <WidgetCard module="snag" viewAllHref="/analyze/gates" viewAllLabel="View Gate Registry">
      <div className="space-y-3">
        {stats && (
          <div className="flex gap-6">
            <div>
              <p className="text-xl font-semibold" style={{ color: MODULE_META.snag.color }}>
                {stats.active}
              </p>
              <p className="text-xs text-muted-foreground">Active gates</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-foreground">{stats.fired}</p>
              <p className="text-xs text-muted-foreground">Signals fired</p>
            </div>
          </div>
        )}
        <ActiveGatesWidget />
        <Link
          to="/analyze"
          className="inline-block text-xs font-medium hover:underline"
          style={{ color: MODULE_META.snag.color }}
        >
          + New gate →
        </Link>
      </div>
    </WidgetCard>
  );
}

// ---------------- PULSE widget ----------------
function PulseWidget() {
  return (
    <WidgetCard module="pulse" viewAllHref="/pulse" viewAllLabel="Open">
      <p className="text-muted-foreground">Pulse workspace coming soon.</p>
    </WidgetCard>
  );
}

// ---------------- Diagnostic chain ----------------
function DiagnosticChain() {
  const { user } = useAuth();
  const [chain, setChain] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: zero } = await (supabase as any)
        .from("zero_sessions")
        .select("id, decision_text, overall_verdict, scan_session_id, created_at")
        .eq("user_id", user.id)
        .not("scan_session_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!zero) {
        setChain(null);
        return;
      }
      const { data: scan } = await supabase
        .from("scan_sessions")
        .select("id, binding_constraint")
        .eq("id", zero.scan_session_id)
        .maybeSingle();
      const { data: snag } = await (supabase as any)
        .from("analyses")
        .select("id, gate_status, original_input")
        .eq("user_id", user.id)
        .eq("source_module", "zero")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setChain({ scan, zero, snag });
    })();
  }, [user]);

  if (chain === undefined) {
    return <div className="h-24 animate-pulse bg-muted rounded" />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="font-semibold">Your diagnostic chain</h3>
      </CardHeader>
      <CardContent>
        {chain === null ? (
          <p className="text-sm text-muted-foreground">
            Run a connected diagnostic — start with Scan, and each step carries forward
            automatically.{" "}
            <Link to="/scan/new" className="font-medium hover:underline" style={{ color: MODULE_META.scan.color }}>
              Start a Scan →
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              to={`/scan`}
              className="px-3 py-1.5 rounded-md border hover:bg-muted"
              style={{ borderColor: MODULE_META.scan.color }}
            >
              <span className="text-xs font-semibold" style={{ color: MODULE_META.scan.color }}>
                SCAN
              </span>
              <span className="ml-2">
                {chain.scan?.binding_constraint?.pillar_name ?? "—"}
                {chain.scan?.binding_constraint?.score != null
                  ? ` · ${chain.scan.binding_constraint.score}/25`
                  : ""}
              </span>
            </Link>
            <span className="text-muted-foreground">→</span>
            <Link
              to={`/zero/${chain.zero.id}`}
              className="px-3 py-1.5 rounded-md border hover:bg-muted"
              style={{ borderColor: MODULE_META.zero.color }}
            >
              <span className="text-xs font-semibold" style={{ color: MODULE_META.zero.color }}>
                ZERO
              </span>
              <span className="ml-2">{verdictBadge(chain.zero.overall_verdict).label}</span>
            </Link>
            <span className="text-muted-foreground">→</span>
            {chain.snag ? (
              <Link
                to={`/analyze/gates`}
                className="px-3 py-1.5 rounded-md border hover:bg-muted"
                style={{ borderColor: MODULE_META.snag.color }}
              >
                <span className="text-xs font-semibold" style={{ color: MODULE_META.snag.color }}>
                  SNAG
                </span>
                <span className="ml-2 uppercase">{chain.snag.gate_status || "—"}</span>
              </Link>
            ) : (
              <Link
                to="/analyze"
                className="px-3 py-1.5 rounded-md border border-dashed text-muted-foreground hover:bg-muted"
              >
                + Gate this decision in SNAG
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------- Status card (pending modules) ----------------
function PendingStatusCard({ access }: { access: any }) {
  const meta = MODULE_META[access.module as NerveModule];
  return (
    <Card className="border-dashed opacity-80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 font-semibold text-muted-foreground">
          {ICONS[access.module as NerveModule]}
          <span style={{ color: meta.color }}>{meta.label}</span>
        </div>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {access.status === "requested"
          ? "Requested — pending review"
          : access.status === "pending_intake"
          ? "Pending intake"
          : access.status === "suspended"
          ? "Suspended"
          : access.status}
      </CardContent>
    </Card>
  );
}

// ---------------- Main ----------------
export default function NerveDashboard() {
  const { nerveProfile, moduleAccess } = useAuth();

  const isActive = (s: string) => s === "active" || s === "trial";
  const activeMods = moduleAccess.filter((m) => isActive(m.status)).map((m) => m.module as NerveModule);
  const pendingMods = moduleAccess.filter((m) => !isActive(m.status));

  const has = (m: NerveModule) => activeMods.includes(m);
  const hasAllCore = has("scan") && has("zero") && has("snag");
  const noneActive = activeMods.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Nerve · Revenue Execution Governance
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Welcome{nerveProfile?.full_name ? `, ${nerveProfile.full_name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-muted-foreground mt-1">
          Your Nerve workspace. Jump into an active module or review your gates.
        </p>
      </header>

      {/* Section 1: status cards for non-active modules */}
      {pendingMods.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Module access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pendingMods.map((m) => (
              <PendingStatusCard key={m.id} access={m} />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: active module widgets */}
      {activeMods.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Your modules
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {has("scan") && <ScanWidget />}
            {has("zero") && <ZeroWidget />}
            {has("snag") && <SnagWidget />}
            {has("pulse") && <PulseWidget />}
          </div>
        </section>
      )}

      {/* Section 3: diagnostic chain */}
      {hasAllCore && (
        <section>
          <DiagnosticChain />
        </section>
      )}

      {/* Section 4: quick actions */}
      {activeMods.length > 0 && (
        <section className="flex flex-wrap gap-2">
          {has("scan") && (
            <Button asChild size="sm" style={{ background: MODULE_META.scan.color, color: "white" }}>
              <Link to="/scan/new">New Scan</Link>
            </Button>
          )}
          {has("zero") && (
            <Button asChild size="sm" style={{ background: MODULE_META.zero.color, color: "white" }}>
              <Link to="/zero/new">New ZERO examination</Link>
            </Button>
          )}
          {has("snag") && (
            <Button asChild size="sm" style={{ background: MODULE_META.snag.color, color: "white" }}>
              <Link to="/analyze">New SNAG gate</Link>
            </Button>
          )}
        </section>
      )}

      {/* Empty state */}
      {noneActive && (
        <Card>
          <CardContent className="py-6 text-sm">
            <p className="text-muted-foreground">
              While you wait, explore{" "}
              <a
                href="https://www.linkedin.com/newsletters/the-revenue-circle-7340927568048250880/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
                style={{ color: MODULE_META.snag.color }}
              >
                The Revenue Circle newsletter <ArrowRight className="inline w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
