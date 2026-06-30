import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Blocks Nerve users (any row in nerve_module_access) from rendering legacy
 * B2C / wellness / team surfaces. Redirects them to /dashboard.
 * Legacy users (no Nerve module access) pass through unchanged.
 */
export function LegacySurfaceGuard({ children }: { children: ReactNode }) {
  const { isLoading, user, moduleAccess } = useAuth();

  if (isLoading) return null;

  // Unauthenticated visitors are handled by route-level auth elsewhere.
  if (!user) return <>{children}</>;

  if (moduleAccess && moduleAccess.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default LegacySurfaceGuard;
