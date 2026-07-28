import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listGatesTool from "./tools/list-gates";
import updateGateStatusTool from "./tools/update-gate-status";
import listScanSessionsTool from "./tools/list-scan-sessions";
import listZeroBeliefsTool from "./tools/list-zero-beliefs";
import getWorkspaceSummaryTool from "./tools/get-workspace-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "nerve-mcp",
  title: "Nerve",
  version: "0.1.0",
  instructions:
    "Tools for the Nerve decision-intelligence workspace. Read SNAG gates, Scan diagnostic sessions and ZERO belief examinations for the signed-in user, and update the status of a SNAG gate.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getWorkspaceSummaryTool,
    listGatesTool,
    updateGateStatusTool,
    listScanSessionsTool,
    listZeroBeliefsTool,
  ],
});
