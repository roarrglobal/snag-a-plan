import { useState } from "react";
import { useAdminData } from "./AdminDataContext";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import UserDetailPanel from "./UserDetailPanel";

export default function AdminIntakes() {
  const { data, refresh } = useAdminData();
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const intakes = (data?.intakes ?? []).slice().sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));

  const markReviewed = async (id: string) => {
    setBusyId(id);
    try {
      await adminApi.markIntakeReviewed(id);
      toast.success("Marked reviewed");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-light mb-6">Intake forms</h1>
      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Company</th>
              <th className="text-left px-4 py-2">ARR</th>
              <th className="text-left px-4 py-2">Modules</th>
              <th className="text-left px-4 py-2">Submitted</th>
              <th className="text-left px-4 py-2">Reviewed</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {intakes.map((i) => {
              const profile = data?.profiles.find((p) => p.id === i.user_id);
              return (
                <tr key={i.id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => setOpenUser(i.user_id)}>
                  <td className="px-4 py-3">{profile?.full_name || "—"}</td>
                  <td className="px-4 py-3">{profile?.company_name || "—"}</td>
                  <td className="px-4 py-3">{i.company_arr || "—"}</td>
                  <td className="px-4 py-3 text-xs uppercase">{i.modules_requested.join(", ")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(i.submitted_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {i.reviewed_at ? formatDistanceToNow(new Date(i.reviewed_at), { addSuffix: true }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {!i.reviewed_at && (
                      <Button size="sm" variant="outline" disabled={busyId === i.id} onClick={() => markReviewed(i.id)}>
                        Mark reviewed
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {intakes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No intake forms submitted yet.
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
