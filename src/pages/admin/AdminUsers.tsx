import { useMemo, useState } from "react";
import { useAdminData } from "./AdminDataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserDetailPanel from "./UserDetailPanel";

const FILTERS = ["All", "Pending", "Active", "Suspended"] as const;
type Filter = (typeof FILTERS)[number];

const statusColor: Record<string, string> = {
  pending_review: "#D97706",
  intake_scheduled: "#0EA5E9",
  intake_complete: "#0EA5E9",
  active: "#0047AB",
  suspended: "#64748B",
};

export default function AdminUsers() {
  const { data } = useAdminData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [openUser, setOpenUser] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = data?.profiles ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      const email = (data?.emails?.[p.id] ?? "").toLowerCase();
      const matchesQuery =
        !q ||
        p.full_name?.toLowerCase().includes(q) ||
        p.company_name?.toLowerCase().includes(q) ||
        email.includes(q);
      const matchesFilter =
        filter === "All" ||
        (filter === "Pending" && p.onboarding_status === "pending_review") ||
        (filter === "Active" && p.onboarding_status === "active") ||
        (filter === "Suspended" && p.onboarding_status === "suspended");
      return matchesQuery && matchesFilter;
    });
  }, [data, query, filter]);

  const activeModulesFor = (uid: string) =>
    (data?.access ?? []).filter((a) => a.user_id === uid && (a.status === "active" || a.status === "trial"))
      .map((a) => a.module.toUpperCase())
      .join(", ") || "—";

  return (
    <div>
      <h1 className="text-2xl font-light mb-6">Users</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Search by name, company, or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded border ${
                filter === f
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-muted-foreground">{rows.length} users</div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Company</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Primary</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Modules</th>
              <th className="text-left px-4 py-2">Joined</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">{p.full_name || "—"}</td>
                <td className="px-4 py-3">{p.company_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{data?.emails?.[p.id] || "—"}</td>
                <td className="px-4 py-3 uppercase text-xs">{p.primary_module || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{
                      background: `${statusColor[p.onboarding_status] ?? "#64748B"}1a`,
                      color: statusColor[p.onboarding_status] ?? "#64748B",
                    }}
                  >
                    {p.onboarding_status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{activeModulesFor(p.id)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setOpenUser(p.id)}>
                    View profile →
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openUser && <UserDetailPanel userId={openUser} onClose={() => setOpenUser(null)} />}
    </div>
  );
}
