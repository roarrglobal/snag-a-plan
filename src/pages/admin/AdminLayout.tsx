import { NavLink, Outlet, Link } from "react-router-dom";
import { AdminDataProvider, useAdminData } from "./AdminDataContext";
import { useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { useLocation } from "react-router-dom";

const NAV = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/access-requests", label: "Access Requests", badge: "requests" as const },
  { to: "/admin/intake-forms", label: "Intake Forms" },
  { to: "/admin/modules", label: "Active Modules" },
];

function Sidebar() {
  const { data, refresh } = useAdminData();
  const location = useLocation();
  const requestCount = (data?.access ?? []).filter((a) => a.status === "requested").length;

  // Reset unread counter when admin lands on /admin/access-requests
  useEffect(() => {
    if (location.pathname === "/admin/access-requests") {
      adminApi.resetUnread().then(() => refresh()).catch(() => null);
    }
  }, [location.pathname, refresh]);

  return (
    <aside
      className="w-[220px] shrink-0 flex flex-col px-5 py-7 text-white"
      style={{ background: "#0A1628", minHeight: "100vh" }}
    >
      <div className="mb-10">
        <div style={{ fontFamily: "Inter", fontWeight: 300, fontSize: 18, color: "#fff" }}>nerve</div>
        <div
          className="flex items-center gap-2 mt-1"
          style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.5)" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#D97706" }} />
          Admin
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `block px-3 py-2 text-sm border-l-2 transition-colors ${
                isActive
                  ? "text-white border-[#0047AB] bg-white/5"
                  : "text-white/70 border-transparent hover:text-white"
              }`
            }
            style={{ fontFamily: "Inter", fontWeight: 400 }}
          >
            <span className="flex items-center justify-between">
              {item.label}
              {item.badge === "requests" && requestCount > 0 && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "#BE3455", color: "#fff" }}
                >
                  {requestCount}
                </span>
              )}
            </span>
          </NavLink>
        ))}
      </nav>
      <Link
        to="/dashboard"
        className="text-xs mt-6 text-white/40 hover:text-white transition-colors"
        style={{ fontFamily: "Inter" }}
      >
        ← Back to app
      </Link>
    </aside>
  );
}

function AdminShell() {
  const { loading, error } = useAdminData();
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 p-10 overflow-x-hidden" style={{ fontFamily: "Inter" }}>
        {error && (
          <div className="mb-4 p-3 rounded text-sm border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}
        {loading && !error ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminDataProvider>
      <AdminShell />
    </AdminDataProvider>
  );
}
