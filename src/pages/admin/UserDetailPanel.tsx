import { useMemo, useState } from "react";
import { useAdminData } from "./AdminDataContext";
import { adminApi, AdminProfile } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MODULES = ["pulse", "scan", "zero", "snag"] as const;
type Mod = (typeof MODULES)[number];

const moduleColor: Record<Mod, string> = {
  pulse: "#16A34A",
  scan: "#0047AB",
  zero: "#D97706",
  snag: "#BE3455",
};

export default function UserDetailPanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { data, refresh } = useAdminData();
  const profile = data?.profiles.find((p) => p.id === userId);
  const email = data?.emails?.[userId] ?? "";
  const access = (data?.access ?? []).filter((a) => a.user_id === userId);
  const intake = (data?.intakes ?? []).find((i) => i.user_id === userId);

  const [busy, setBusy] = useState(false);
  const [calendly, setCalendly] = useState(profile?.calendly_url ?? "");
  const [notes, setNotes] = useState(profile?.notes ?? "");
  const [editing, setEditing] = useState(false);
  const [editPatch, setEditPatch] = useState<Partial<AdminProfile>>({});

  const moduleStatus = (m: Mod) => access.find((a) => a.module === m)?.status ?? null;

  const moduleSummary = useMemo(() => {
    const lastScan = (data?.access ?? []).find(
      (a) => a.user_id === userId && a.module === "scan" && a.activated_at,
    );
    return {
      scan: lastScan?.activated_at,
      zero: access.find((a) => a.module === "zero" && a.activated_at)?.activated_at,
      snag: access.find((a) => a.module === "snag" && a.activated_at)?.activated_at,
    };
  }, [data, access, userId]);

  if (!profile) return null;

  async function withBusy<T>(fn: () => Promise<T>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleModule(m: Mod, on: boolean) {
    if (on) {
      await withBusy(async () => {
        await adminApi.activateModule(userId, m);
        toast.success(`${m.toUpperCase()} activated · email sent`);
      });
    } else {
      await withBusy(async () => {
        await adminApi.suspendModule(userId, m);
        toast.success(`${m.toUpperCase()} suspended`);
      });
    }
  }

  async function setTrial(m: Mod, days: number) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    await withBusy(async () => {
      await adminApi.activateModule(userId, m, until.toISOString());
      toast.success(`${m.toUpperCase()} trial set for ${days} days`);
    });
  }

  async function handleSchedule() {
    if (!calendly.trim()) {
      toast.error("Paste a calendar link first");
      return;
    }
    await withBusy(async () => {
      await adminApi.scheduleIntake(userId, calendly.trim());
      toast.success("Intake scheduled · email sent");
    });
  }

  async function handleActivateAll() {
    const primary = (profile.primary_module ?? "scan") as Mod;
    await withBusy(async () => {
      await adminApi.activateModule(userId, primary);
      toast.success(`${primary.toUpperCase()} activated · email sent`);
    });
  }

  async function handleMarkIntakeComplete() {
    await withBusy(async () => {
      await adminApi.markIntakeComplete(userId);
      toast.success("Intake marked complete");
    });
  }

  async function saveNotes() {
    await withBusy(async () => {
      await adminApi.updateProfile(userId, { notes });
      toast.success("Notes saved");
    });
  }

  async function saveProfileEdits() {
    await withBusy(async () => {
      await adminApi.updateProfile(userId, editPatch);
      toast.success("Profile updated");
      setEditing(false);
      setEditPatch({});
    });
  }

  const status = profile.onboarding_status;
  const canActivateModules = status === "intake_complete" || status === "pending_review" || status === "intake_scheduled" || status === "active";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[480px] bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{profile.full_name || "Unnamed user"}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Profile */}
          <section>
            <SectionHeader title="Profile" action={
              <button className="text-xs text-blue-600 hover:underline" onClick={() => {
                setEditing((v) => !v);
                setEditPatch({});
              }}>
                {editing ? "Cancel" : "Edit"}
              </button>
            } />
            {!editing ? (
              <dl className="text-sm space-y-1">
                <Row label="Company">{profile.company_name || "—"}</Row>
                <Row label="Job title">{profile.job_title || "—"}</Row>
                <Row label="Team size">{profile.team_size || "—"}</Row>
                <Row label="Primary module">{(profile.primary_module ?? "—").toUpperCase()}</Row>
              </dl>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Full name"
                  defaultValue={profile.full_name}
                  onChange={(e) => setEditPatch((p) => ({ ...p, full_name: e.target.value }))}
                />
                <Input
                  placeholder="Company"
                  defaultValue={profile.company_name}
                  onChange={(e) => setEditPatch((p) => ({ ...p, company_name: e.target.value }))}
                />
                <Input
                  placeholder="Job title"
                  defaultValue={profile.job_title ?? ""}
                  onChange={(e) => setEditPatch((p) => ({ ...p, job_title: e.target.value }))}
                />
                <Input
                  placeholder="Team size"
                  defaultValue={profile.team_size ?? ""}
                  onChange={(e) => setEditPatch((p) => ({ ...p, team_size: e.target.value }))}
                />
                <Button size="sm" disabled={busy} onClick={saveProfileEdits}>
                  Save profile
                </Button>
              </div>
            )}
          </section>

          {/* Status */}
          <section>
            <SectionHeader title="Status" />
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-[10px] px-2 py-1 rounded-full uppercase tracking-wide"
                style={{ background: "#0047AB1a", color: "#0047AB" }}
              >
                {status.replace("_", " ")}
              </span>
            </div>

            {status === "pending_review" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Calendar link (e.g. Calendly)</label>
                  <Input
                    placeholder="https://calendly.com/..."
                    value={calendly}
                    onChange={(e) => setCalendly(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={handleSchedule}>
                    Schedule intake
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={handleActivateAll}>
                    Activate directly
                  </Button>
                </div>
              </div>
            )}

            {status === "intake_scheduled" && (
              <div className="space-y-3">
                {profile.calendly_url && (
                  <p className="text-xs text-muted-foreground">
                    Scheduled link:{" "}
                    <a href={profile.calendly_url} target="_blank" rel="noreferrer" className="underline">
                      {profile.calendly_url}
                    </a>
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={handleMarkIntakeComplete}>
                    Mark intake complete
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={handleActivateAll}>
                    Activate
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Module activation */}
          {canActivateModules && (
            <section>
              <SectionHeader title="Activate modules" />
              <div className="space-y-3">
                {MODULES.map((m) => {
                  const s = moduleStatus(m);
                  const isOn = s === "active" || s === "trial";
                  return (
                    <div key={m} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ background: moduleColor[m] }}
                          />
                          <span className="font-medium uppercase text-sm">{m}</span>
                          {s && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                              {s}
                            </span>
                          )}
                        </div>
                        <Switch
                          checked={isOn}
                          disabled={busy}
                          onCheckedChange={(v) => toggleModule(m, v)}
                        />
                      </div>
                      <div className="flex gap-3 text-xs">
                        <button
                          className="text-blue-600 hover:underline"
                          disabled={busy}
                          onClick={() => setTrial(m, 14)}
                        >
                          Set 14-day trial
                        </button>
                        <button
                          className="text-blue-600 hover:underline"
                          disabled={busy}
                          onClick={() => setTrial(m, 30)}
                        >
                          Set 30-day trial
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Intake form */}
          {intake && (
            <section>
              <SectionHeader title="Intake form" />
              <dl className="text-sm space-y-2">
                <Row label="Submitted">
                  {formatDistanceToNow(new Date(intake.submitted_at), { addSuffix: true })}
                </Row>
                <Row label="ARR">{intake.company_arr || "—"}</Row>
                <Row label="Modules">{intake.modules_requested.join(", ") || "—"}</Row>
                <Row label="How found">{intake.how_found || "—"}</Row>
                <div>
                  <div className="text-xs uppercase text-muted-foreground mt-2 mb-1">Situation</div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{intake.current_situation}</p>
                </div>
                {intake.team_context && (
                  <div>
                    <div className="text-xs uppercase text-muted-foreground mt-2 mb-1">Team context</div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{intake.team_context}</p>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Admin notes */}
          <section>
            <SectionHeader title="Admin notes (private)" />
            <Textarea
              rows={4}
              value={notes}
              placeholder="Internal notes about this user…"
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button size="sm" className="mt-2" disabled={busy} onClick={saveNotes}>
              Save notes
            </Button>
          </section>

          {/* Activity summary */}
          <section>
            <SectionHeader title="Module activity" />
            <dl className="text-sm space-y-1">
              <Row label="Last scan">
                {moduleSummary.scan ? formatDistanceToNow(new Date(moduleSummary.scan), { addSuffix: true }) : "—"}
              </Row>
              <Row label="Last ZERO">
                {moduleSummary.zero ? formatDistanceToNow(new Date(moduleSummary.zero), { addSuffix: true }) : "—"}
              </Row>
              <Row label="Last SNAG">
                {moduleSummary.snag ? formatDistanceToNow(new Date(moduleSummary.snag), { addSuffix: true }) : "—"}
              </Row>
            </dl>
          </section>
        </div>
      </aside>
    </>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {action}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
