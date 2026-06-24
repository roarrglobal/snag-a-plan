import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminData } from "./AdminDataContext";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import UserDetailPanel from "./UserDetailPanel";

function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export default function AdminOverview() {
  const { data } = useAdminData();
  const [openUser, setOpenUser] = useState<string | null>(null);

  const stats = useMemo(() => {
    const profiles = data?.profiles ?? [];
    const access = data?.access ?? [];
    return {
      total: profiles.length,
      pending: profiles.filter((p) => p.onboarding_status === "pending_review").length,
      active: profiles.filter((p) => p.onboarding_status === "active").length,
      requests: access.filter((a) => a.status === "requested").length,
    };
  }, [data]);

  const pending = (data?.profiles ?? []).filter((p) => p.onboarding_status === "pending_review");
  const recent = useMemo(() => {
    const events = (data?.access ?? [])
      .filter((a) => a.activated_at)
      .sort((a, b) => (b.activated_at ?? "").localeCompare(a.activated_at ?? ""))
      .slice(0, 10);
    return events;
  }, [data]);

  const nameFor = (uid: string) =>
    data?.profiles.find((p) => p.id === uid)?.full_name || data?.emails?.[uid] || "Unknown";

  return (
    <div>
      <h1 className="text-2xl font-light mb-1">Overview</h1>
      <p className="text-sm text-muted-foreground mb-8">Operational view of the Nerve user base.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total users" value={stats.total} />
        <StatCard
          label="Pending review"
          value={stats.pending}
          accent={stats.pending > 0 ? "#D97706" : undefined}
        />
        <StatCard label="Active users" value={stats.active} accent="#0047AB" />
        <StatCard
          label="Access requests"
          value={stats.requests}
          accent={stats.requests > 0 ? "#BE3455" : undefined}
        />
      </div>

      <Section title="Needs action">
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users awaiting review.</p>
        ) : (
          <div className="border rounded-md overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Company</th>
                  <th className="text-left px-4 py-2">Module</th>
                  <th className="text-left px-4 py-2">Submitted</th>
                  <th className="text-right px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.full_name || "—"}</td>
                    <td className="px-4 py-3">{p.company_name || "—"}</td>
                    <td className="px-4 py-3 uppercase text-xs">{p.primary_module || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{timeAgo(p.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setOpenUser(p.id)}>
                        View →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Recent activity">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activations yet.</p>
        ) : (
          <ul className="text-sm space-y-2">
            {recent.map((e) => (
              <li key={e.id} className="text-slate-700">
                <button className="underline-offset-2 hover:underline" onClick={() => setOpenUser(e.user_id)}>
                  {nameFor(e.user_id)}
                </button>{" "}
                activated for <span className="uppercase font-medium">{e.module}</span> —{" "}
                <span className="text-muted-foreground">{e.activated_at ? timeAgo(e.activated_at) : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {openUser && <UserDetailPanel userId={openUser} onClose={() => setOpenUser(null)} />}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="bg-white border rounded-md p-5">
      <div className="text-xs uppercase text-muted-foreground mb-2">{label}</div>
      <div
        className="text-3xl font-light"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">{title}</h2>
      {children}
    </section>
  );
}
