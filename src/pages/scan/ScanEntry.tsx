import { useAuth } from "@/contexts/AuthContext";
import ScanGate from "./ScanGate";
import ScanInputs from "./ScanInputs";

export default function ScanEntry() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user && sessionStorage.getItem("nerve_scan_guest") !== "true") {
    return <ScanGate />;
  }
  return <ScanInputs />;
}
