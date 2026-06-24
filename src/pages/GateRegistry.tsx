import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

type GateStatus = "active" | "fired" | "cleared" | "expired";

interface Gate {
  id: string;
  title: string | null;
  original_input: string;
  result: any;
  created_at: string;
  gate_status: GateStatus;
  owner_name: string | null;
  signal_due_date: string | null;
  source_module: string | null;
  source_session_id: string | null;
}

const STATUS_PILL: Record<GateStatus, { bg: string; color: string; label: string }> = {
  active:  { bg: "#FFF1F2", color: "#BE3455", label: "ACTIVE" },
  fired:   { bg: "#FFFBEB", color: "#D97706", label: "SIGNAL FIRED" },
  cleared: { bg: "#F0FDF4", color: "#166534", label: "CLEARED" },
  expired: { bg: "#F8FAFC", color: "#64748B", label: "EXPIRED" },
};

const pickStr = (r: any, keys: string[]): string => {
  for (const k of keys) {
    const v = r?.[k];
    if (Array.isArray(v) && v.length > 0) {
      const first = v[0];
      if (typeof first === "string") return first;
      if (first?.text) return first.text;
      if (first?.description) return first.description;
    } else if (typeof v === "string" && v.trim()) {
      return v;
    }
  }
  return "";
};

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n).trim() + "…" : s);

export default function GateRegistry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | GateStatus>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [ownerEdit, setOwnerEdit] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("analyses" as any)
        .select("id, title, original_input, result, created_at, gate_status, owner_name, signal_due_date, source_module, source_session_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const rows = (data as unknown as Gate[]) || [];
      const missing = rows.filter((g) => !g.signal_due_date);
      if (missing.length > 0) {
        await Promise.all(
          missing.map((g) => {
            const due = new Date(new Date(g.created_at).getTime() + 30 * 86400000).toISOString();
            g.signal_due_date = due;
            return supabase
              .from("analyses" as any)
              .update({ signal_due_date: due } as any)
              .eq("id", g.id)
              .eq("user_id", user.id);
          })
        );
      }
      setGates(rows);
      setLoading(false);
    })();
  }, [user]);

  const counts = useMemo(() => {
    const c = { total: gates.length, active: 0, fired: 0, cleared: 0, expired: 0 };
    gates.forEach((g) => {
      const s = (g.gate_status || "active") as GateStatus;
      if (s in c) (c as any)[s]++;
    });
    return c;
  }, [gates]);

  const visible = useMemo(() => {
    if (filter === "all") return gates;
    return gates.filter((g) => (g.gate_status || "active") === filter);
  }, [gates, filter]);

  const updateStatus = async (id: string, next: GateStatus) => {
    const prev = gates;
    setGates((gs) => gs.map((g) => (g.id === id ? { ...g, gate_status: next } : g)));
    const { error } = await supabase
      .from("analyses" as any)
      .update({ gate_status: next, updated_at: new Date().toISOString() } as any)
      .eq("id", id)
      .eq("user_id", user!.id);
    if (error) {
      setGates(prev);
      toast.error("Could not update gate. Please try again.");
    } else {
      toast.success(`Gate marked as ${next}`, {
        style: { background: "#BE3455", color: "white", border: "none" },
      });
    }
  };

  const saveOwner = async (id: string) => {
    const name = (ownerEdit[id] || "").trim();
    const prev = gates;
    setGates((gs) => gs.map((g) => (g.id === id ? { ...g, owner_name: name || null } : g)));
    setOwnerEdit((o) => {
      const { [id]: _, ...rest } = o;
      return rest;
    });
    const { error } = await supabase
      .from("analyses" as any)
      .update({ owner_name: name || null } as any)
      .eq("id", id)
      .eq("user_id", user!.id);
    if (error) {
      setGates(prev);
      toast.error("Could not save owner.");
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span
            style={{
              background: "#BE3455", color: "white", fontWeight: 600,
              fontSize: 11, letterSpacing: "0.1em", padding: "4px 12px",
              borderRadius: 980,
            }}
          >
            SNAG
          </span>
          <span style={{ color: "#6B7280", fontSize: 14 }}>Gate Registry</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 300, color: "#0A1628", letterSpacing: "-0.02em" }}>
          Active Gates
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatCard n={counts.total} label="Total gates created" color="#0A1628" />
          <StatCard n={counts.active} label="Active — awaiting signal" color="#BE3455" />
          <StatCard n={counts.fired} label="Signal fired" color="#D97706" />
          <StatCard n={counts.cleared} label="Cleared — decision gated" color="#0D9488" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          {(["all","active","fired","cleared","expired"] as const).map((f) => (
            <FilterPill
              key={f}
              active={filter === f}
              onClick={() => setFilter(f)}
              label={f === "all" ? "All" : f === "fired" ? "Signal fired" : f[0].toUpperCase() + f.slice(1)}
            />
          ))}
          <div className="flex-1" />
          <button
            onClick={() => navigate("/analyze")}
            style={{
              background: "#BE3455", color: "white", border: "none",
              padding: "8px 18px", borderRadius: 980, fontWeight: 500,
              fontSize: 14, cursor: "pointer",
            }}
          >
            + New gate
          </button>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div style={{ color: "#6B7280", padding: 40, textAlign: "center" }}>Loading…</div>
          ) : visible.length === 0 ? (
            gates.length === 0 ? (
              <EmptyState onClick={() => navigate("/analyze")} />
            ) : (
              <div style={{ color: "#6B7280", padding: 40, textAlign: "center" }}>
                No gates in this filter.
              </div>
            )
          ) : (
            visible.map((g) => (
              <GateCard
                key={g.id}
                gate={g}
                expanded={!!expanded[g.id]}
                onToggle={() => setExpanded((e) => ({ ...e, [g.id]: !e[g.id] }))}
                onStatus={(s) => updateStatus(g.id, s)}
                ownerEditing={ownerEdit[g.id] !== undefined}
                ownerDraft={ownerEdit[g.id] ?? ""}
                onStartOwnerEdit={() => setOwnerEdit((o) => ({ ...o, [g.id]: g.owner_name || "" }))}
                onChangeOwner={(v) => setOwnerEdit((o) => ({ ...o, [g.id]: v }))}
                onSaveOwner={() => saveOwner(g.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontWeight: 300, fontSize: 36, color, lineHeight: 1 }}>{n}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#6B7280" }}>{label}</div>
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#BE3455" : "white",
        color: active ? "white" : "#6B7280",
        border: active ? "none" : "1px solid #E5E7EB",
        padding: "7px 16px", borderRadius: 980, fontSize: 13, fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function GateCard({
  gate, expanded, onToggle, onStatus,
  ownerEditing, ownerDraft, onStartOwnerEdit, onChangeOwner, onSaveOwner,
}: {
  gate: Gate;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: GateStatus) => void;
  ownerEditing: boolean;
  ownerDraft: string;
  onStartOwnerEdit: () => void;
  onChangeOwner: (v: string) => void;
  onSaveOwner: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const status = (gate.gate_status || "active") as GateStatus;
  const pill = STATUS_PILL[status];
  const r = gate.result || {};

  const surface = pickStr(r, ["blind_spots", "surface", "hidden_assumptions"]);
  const name = pickStr(r, ["failure_modes", "name", "failure_mode"]);
  const alert = pickStr(r, ["warning_signals", "alert", "alerts"]);
  const gateOut = pickStr(r, ["kill_criteria", "gate", "kill_criterion"]);
  const unasked = pickStr(r, ["unasked_question", "question"]);

  const due = gate.signal_due_date ? new Date(gate.signal_due_date) : null;
  const now = new Date();
  const dueColor =
    status === "cleared" ? "#166534"
      : due && due < now ? "#BE3455"
      : "#D97706";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "white",
        border: `1px solid ${hover ? "rgba(190,52,85,0.4)" : "#E5E7EB"}`,
        borderRadius: 12,
        padding: "24px 28px",
        marginBottom: 12,
        boxShadow: hover ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
        transition: "all 0.15s ease",
      }}
    >
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* Row 1 */}
          <div className="flex items-center flex-wrap">
            <span style={{
              background: pill.bg, color: pill.color, fontWeight: 700,
              fontSize: 10, letterSpacing: "0.08em",
              padding: "3px 8px", borderRadius: 980,
            }}>{pill.label}</span>
            <span style={{ marginLeft: 12, fontSize: 13, color: "#6B7280" }}>
              Gated {formatDistanceToNow(new Date(gate.created_at), { addSuffix: true })}
            </span>
            {gate.source_module && gate.source_module !== "direct" && (
              <span style={{
                marginLeft: 12, fontSize: 12,
                color: gate.source_module === "scan" ? "#0047AB" : "#D97706",
              }}>
                ↳ from {gate.source_module.toUpperCase()}
              </span>
            )}
          </div>

          {/* Row 2 */}
          <div style={{
            marginTop: 12, fontSize: 16, fontWeight: 500, color: "#0A1628",
            lineHeight: 1.4,
          }}>
            {trunc(gate.original_input || gate.title || "Untitled gate", 120)}
          </div>

          {/* Row 3 */}
          <div style={{ marginTop: 8, fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
            {surface && <div>S: {trunc(surface, 60)}</div>}
            {gateOut && <div>G: {trunc(gateOut, 60)}</div>}
            {due && <div>A: Due {format(due, "MMM d, yyyy")}</div>}
          </div>

          {/* Row 4 */}
          {gate.owner_name && !ownerEditing && (
            <div style={{ marginTop: 6, fontSize: 13, color: "#6B7280" }}>
              Owner: {gate.owner_name}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2" style={{ flexShrink: 0 }}>
          {status === "active" && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  background: "white", color: "#BE3455",
                  border: "1px solid #BE3455", padding: "6px 14px",
                  borderRadius: 980, fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                Update status ↓
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)",
                  background: "white", border: "1px solid #E5E7EB", borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 10, minWidth: 180,
                }}>
                  {(["fired","cleared","expired"] as GateStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setMenuOpen(false); onStatus(s); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "10px 14px", background: "transparent", border: "none",
                        fontSize: 13, color: "#0A1628", cursor: "pointer",
                      }}
                    >
                      Mark {s === "fired" ? "signal fired" : s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {status === "fired" && (
            <button
              onClick={() => onStatus("cleared")}
              style={{
                background: "#BE3455", color: "white", border: "none",
                padding: "6px 14px", borderRadius: 980, fontSize: 13,
                fontWeight: 500, cursor: "pointer",
              }}
            >
              Mark cleared →
            </button>
          )}
          {(status === "cleared" || status === "expired") && (
            <span style={{ fontSize: 13, color: "#6B7280" }}>Final</span>
          )}

          {ownerEditing ? (
            <input
              autoFocus
              value={ownerDraft}
              onChange={(e) => onChangeOwner(e.target.value)}
              onBlur={onSaveOwner}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              placeholder="Owner name or email"
              style={{
                fontSize: 13, padding: "6px 10px", border: "1px solid #E5E7EB",
                borderRadius: 8, width: 200,
              }}
            />
          ) : !gate.owner_name ? (
            <button
              onClick={onStartOwnerEdit}
              style={{ background: "transparent", border: "none", color: "#BE3455",
                fontSize: 13, cursor: "pointer", padding: 0 }}
            >
              Assign owner
            </button>
          ) : null}

          <button
            onClick={onToggle}
            style={{
              background: "transparent", border: "none", color: "#BE3455",
              fontSize: 14, fontWeight: 500, cursor: "pointer", padding: 0,
            }}
          >
            {expanded ? "Hide details ↑" : "View full analysis →"}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #F3F4F6" }}>
          <ExpandedRow label="S — Surface" body={surface} />
          <ExpandedRow label="N — Name" body={name} />
          <ExpandedRow
            label="A — Alert"
            body={alert}
            extra={due && (
              <div style={{ marginTop: 6, fontSize: 13, color: dueColor, fontWeight: 500 }}>
                Signal due: {format(due, "MMMM d, yyyy")}
              </div>
            )}
          />
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#BE3455",
              letterSpacing: "0.08em", textTransform: "uppercase" }}>G — Gate</div>
            <div style={{
              marginTop: 8, background: "#FFF1F2",
              borderLeft: "3px solid #BE3455", padding: 16, borderRadius: "0 8px 8px 0",
              fontFamily: "Inter", fontWeight: 500, fontSize: 15, color: "#881337",
              lineHeight: 1.5,
            }}>
              {gateOut || <em style={{ opacity: 0.6 }}>No gate criterion captured.</em>}
            </div>
          </div>
          {unasked && <ExpandedRow label="? — The unasked question" body={unasked} />}
          <div style={{ marginTop: 16 }}>
            <Link to={`/analysis/${gate.id}`}
              style={{ color: "#BE3455", fontSize: 13, fontWeight: 500 }}>
              Open full analysis page →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandedRow({ label, body, extra }: { label: string; body: string; extra?: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#BE3455",
        letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 14, color: "#0A1628", lineHeight: 1.55 }}>
        {body || <em style={{ color: "#6B7280" }}>Not captured.</em>}
      </div>
      {extra}
    </div>
  );
}

function EmptyState({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontWeight: 300, fontSize: 96, color: "rgba(190,52,85,0.15)", lineHeight: 1 }}>G</div>
      <div style={{
        margin: "20px auto 0", width: 60, height: 40, position: "relative",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
          background: "rgba(190,52,85,0.3)", borderRadius: 2 }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 4,
          background: "rgba(190,52,85,0.3)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 4,
          background: "rgba(190,52,85,0.3)", borderRadius: 2, transform: "translateY(-50%)" }} />
      </div>
      <h2 style={{ marginTop: 24, fontWeight: 300, fontSize: 24, color: "#0A1628" }}>
        No gates created yet
      </h2>
      <p style={{ marginTop: 12, color: "#6B7280", fontSize: 14, maxWidth: 480,
        margin: "12px auto 0", lineHeight: 1.6 }}>
        Every major revenue commitment should clear a gate before resources are deployed.
        Your first gate is the decision your team is about to make.
      </p>
      <button
        onClick={onClick}
        style={{
          marginTop: 24, background: "#BE3455", color: "white",
          border: "none", padding: "12px 24px", borderRadius: 980,
          fontWeight: 500, fontSize: 14, cursor: "pointer",
        }}
      >
        Create your first gate →
      </button>
    </div>
  );
}
