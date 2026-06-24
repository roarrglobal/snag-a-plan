import { useMemo, useState } from "react";
import { useAdminData } from "./AdminDataContext";
import UserDetailPanel from "./UserDetailPanel";
import { formatDistanceToNow } from "date-fns";

const MODULES = ["pulse", "scan", "zero", "snag"] as const;

const moduleColor: Record<string, string> = {
  pulse: "#16A34A",
  scan: "#0047AB",
  zero: "#D97706",
  snag: "#BE3455",
};

export default function AdminModules() {
  const { data } = useAdminData();
  const [openUser, setOpenUser] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const out: Record<string, typeof data.access> = {} as any;
    for (const m of MODULES) {
      out[m] = (data?.access ?? []).filter(
        (a) => a.module === m && (a.status === "active" || a.status === "trial"),
      );
    }
    return out;
  }, [data]);

  return (
    <div>
      <h1 className="text-2xl font-light mb-6">Active modules</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MODULES.map((m) => (
          <div key={m} className="bg-white border rounded-md overflow-hidden">
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ background: `${moduleColor[m]}0d` }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: moduleColor[m] }} />
                <span className="font-medium uppercase text-sm">{m}</span>
              </div>
              <span className="text-xs text-muted-foreground">{grouped[m]?.length ?? 0} active</span>
            </div>
            <ul className="divide-y text-sm">
              {(grouped[m] ?? []).map((a) => {
                const profile = data?.profiles.find((p) => p.id === a.user_id);
                return (
                  <li
                    key={a.id}
                    className="px-4 py-3 flex justify-between hover:bg-slate-50 cursor-pointer"
                    onClick={() => setOpenUser(a.user_id)}
                  >
                    <span>
                      {profile?.full_name || "Unknown"}{" "}
                      <span className="text-muted-foreground">· {profile?.company_name || "—"}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.status === "trial" ? "Trial · " : ""}
                      {a.activated_at
                        ? formatDistanceToNow(new Date(a.activated_at), { addSuffix: true })
                        : ""}
                    </span>
                  </li>
                );
              })}
              {(grouped[m]?.length ?? 0) === 0 && (
                <li className="px-4 py-6 text-center text-xs text-muted-foreground">No users active.</li>
              )}
            </ul>
          </div>
        ))}
      </div>
      {openUser && <UserDetailPanel userId={openUser} onClose={() => setOpenUser(null)} />}
    </div>
  );
}
