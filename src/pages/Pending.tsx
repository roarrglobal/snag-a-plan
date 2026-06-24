import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PendingState } from "@/components/nerve/PendingState";
import type { NerveModule } from "@/lib/nerveAccess";

export default function Pending() {
  const { user, isLoading, nerveProfile, moduleAccess } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login?redirect=/pending" replace />;

  const primary = (nerveProfile?.primary_module ?? moduleAccess[0]?.module ?? "scan") as NerveModule;
  const intakeScheduled =
    nerveProfile?.onboarding_status === "intake_scheduled" ||
    moduleAccess.some((m) => m.status === "pending_intake");

  return (
    <div>
      <PendingState module={primary} intakeScheduled={intakeScheduled} />
      <div className="bg-white px-8 pb-20 -mt-4">
        <div className="max-w-[560px] mx-auto border-t border-[#E5E7EB] pt-8">
          <p className="text-sm font-medium text-[#0A1628] mb-3">
            Access all free resources while you wait:
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                className="text-[#0047AB] hover:underline"
                href="https://www.linkedin.com/newsletters/the-revenue-circle-7239797128566693888/"
                target="_blank"
                rel="noreferrer"
              >
                The Revenue Circle Newsletter →
              </a>
            </li>
            <li>
              <a
                className="text-[#0047AB] hover:underline"
                href="https://www.maheshiyer.com/first-principles-done-properly"
                target="_blank"
                rel="noreferrer"
              >
                First Principles, Done Properly →
              </a>
            </li>
            <li>
              <a className="text-[#0047AB] hover:underline" href="/">
                About Nerve →
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
