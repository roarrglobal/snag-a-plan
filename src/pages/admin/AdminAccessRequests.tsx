import { useMemo, useState } from "react";
import { useAdminData } from "./AdminDataContext";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminAccessRequests() {
  const { data, refresh } = useAdminData();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const rows = useMemo(
    () =>
      (data?.access ?? [])
        .filter((a) => a.status === "requested")
        .sort((a, b) => b.requested_at.localeCompare(a.requested_at)),
    [data],
  );

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const activate = async (userId: string, module: string) => {
    setBusy(true);
    try {
      await adminApi.activateModule(userId, module);
      toast.success(`${module.toUpperCase()} activated · email sent`);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Activation failed");
    } finally {
      setBusy(false);
    }
  };

  const activateSelected = async () => {
    setBusy(true);
    try {
      for (const id of selected) {
        const row = rows.find((r) => r.id === id);
        if (row) await adminApi.activateModule(row.user_id, row.module);
      }
      toast.success(`${selected.size} request(s) activated`);
      setSelected(new Set());
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk activation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light">Access requests</h1>
        {selected.size > 0 && (
          <Button size="sm" disabled={busy} onClick={activateSelected}>
            Activate selected ({selected.size})
          </Button>
        )}
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 w-8" />
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Company</th>
              <th className="text-left px-4 py-2">Module</th>
              <th className="text-left px-4 py-2">Requested</th>
              <th className="text-right px-4 py-2">Quick activate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const profile = data?.profiles.find((p) => p.id === a.user_id);
              return (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-3">
                    <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} />
                  </td>
                  <td className="px-4 py-3">
                    {profile?.full_name || data?.emails?.[a.user_id] || "Unknown"}
                  </td>
                  <td className="px-4 py-3">{profile?.company_name || "—"}</td>
                  <td className="px-4 py-3 uppercase text-xs">{a.module}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(a.requested_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" disabled={busy} onClick={() => activate(a.user_id, a.module)}>
                      Activate {a.module.toUpperCase()} →
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No pending access requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
