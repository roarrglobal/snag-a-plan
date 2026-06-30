import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, ScanLine, CircleDashed, Radar } from "lucide-react";
import { MODULE_META, type NerveModule } from "@/lib/nerveAccess";
import ActiveGatesWidget from "@/components/dashboard/ActiveGatesWidget";

const ICONS: Record<NerveModule, JSX.Element> = {
  pulse: <Radar className="w-5 h-5" />,
  scan: <ScanLine className="w-5 h-5" />,
  zero: <CircleDashed className="w-5 h-5" />,
  snag: <ShieldCheck className="w-5 h-5" />,
};

const MODULE_HREF: Record<NerveModule, string> = {
  pulse: "/pulse",
  scan: "/scan",
  zero: "/zero",
  snag: "/analyze",
};

export default function NerveDashboard() {
  const { nerveProfile, moduleAccess } = useAuth();

  const activeModules = moduleAccess.filter((m) => m.status === "active" || m.status === "trial");
  const pendingModules = moduleAccess.filter(
    (m) => m.status === "requested" || m.status === "pending_intake"
  );

  const hasSnag = activeModules.some((m) => m.module === "snag");

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

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Your modules
        </h2>
        {activeModules.length === 0 && pendingModules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No modules yet. An admin will activate your access shortly.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeModules.map((m) => {
              const meta = MODULE_META[m.module as NerveModule];
              return (
                <Link key={m.id} to={MODULE_HREF[m.module as NerveModule]} className="group">
                  <Card
                    className="h-full transition-shadow hover:shadow-md border-l-4"
                    style={{ borderLeftColor: meta.color }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 font-semibold"
                          style={{ color: meta.color }}
                        >
                          {ICONS[m.module as NerveModule]}
                          {meta.label}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {meta.description}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            {pendingModules.map((m) => {
              const meta = MODULE_META[m.module as NerveModule];
              return (
                <Card key={m.id} className="h-full border-dashed opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 font-semibold text-muted-foreground">
                      {ICONS[m.module as NerveModule]}
                      {meta.label}
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {m.status === "requested" ? "Requested — pending review" : "Pending intake"}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {hasSnag && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active gates
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/analyze/gates">View all →</Link>
            </Button>
          </div>
          <ActiveGatesWidget />
        </section>
      )}
    </div>
  );
}
