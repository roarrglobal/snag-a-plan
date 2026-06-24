import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActiveGate {
  id: string;
  original_input: string;
  title: string | null;
  signal_due_date: string | null;
  created_at: string;
}

export function ActiveGatesWidget() {
  const { user } = useAuth();
  const [gates, setGates] = useState<ActiveGate[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, count } = await supabase
        .from("analyses" as any)
        .select("id, title, original_input, signal_due_date, created_at", { count: "exact" })
        .eq("user_id", user.id)
        .eq("gate_status", "active")
        .order("created_at", { ascending: false })
        .limit(3);
      setGates((data as unknown as ActiveGate[]) || []);
      setTotal(count || 0);
    })();
  }, [user]);

  return (
    <div style={{
      background: "white", border: "1px solid #E5E7EB", borderRadius: 12,
      padding: 24, fontFamily: "Inter, sans-serif",
    }}>
      <div className="flex items-center justify-between">
        <div style={{ fontWeight: 500, fontSize: 16, color: "#0A1628" }}>Active Gates</div>
        <Link to="/analyze/gates" style={{ color: "#BE3455", fontSize: 14 }}>
          View all →
        </Link>
      </div>

      {gates.length === 0 ? (
        <div style={{ marginTop: 16, fontSize: 14, color: "#6B7280" }}>
          No active gates.{" "}
          <Link to="/analyze" style={{ color: "#BE3455", fontWeight: 500 }}>
            Gate your next revenue decision →
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {gates.map((g) => {
            const due = g.signal_due_date
              ? new Date(g.signal_due_date)
              : new Date(new Date(g.created_at).getTime() + 30 * 86400000);
            const text = g.original_input || g.title || "Untitled";
            const truncated = text.length > 60 ? text.slice(0, 60).trim() + "…" : text;
            return (
              <Link
                key={g.id}
                to="/analyze/gates"
                className="flex items-center justify-between"
                style={{
                  padding: "10px 0", borderTop: "1px solid #F3F4F6",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 14, color: "#0A1628" }}>{truncated}</span>
                <span style={{ fontSize: 13, color: "#6B7280", flexShrink: 0, marginLeft: 12 }}>
                  Due {formatDistanceToNow(due, { addSuffix: true })}
                </span>
              </Link>
            );
          })}
          {total > 3 && (
            <Link to="/analyze/gates" style={{
              display: "inline-block", marginTop: 12,
              color: "#BE3455", fontSize: 13, fontWeight: 500,
            }}>
              And {total - 3} more →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
