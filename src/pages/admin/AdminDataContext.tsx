import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { adminApi, AdminData } from "@/lib/adminApi";

interface Ctx {
  data: AdminData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AdminDataContext = createContext<Ctx | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminApi.fetch();
      setData(d);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AdminDataContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
}
