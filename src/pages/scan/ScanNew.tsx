import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScanShell } from "@/scan/ScanShell";
import { ScanStepper } from "@/scan/ScanStepper";
import { InputsStep } from "@/scan/steps/InputsStep";
import { PillarsStep } from "@/scan/steps/PillarsStep";
import {
  finalizeSession,
  getLatestInProgress,
  getSession,
  deserializeScores,
  ScanSessionRow,
} from "@/lib/scanSessions";
import { PILLARS } from "@/scan/pillars";
import { isPillarComplete, computeBindingConstraint, computeImpact, type Scores, type CompanyInputs } from "@/scan/calc";

type Stage = "loading" | "resume_prompt" | "inputs" | "pillars" | "finalizing";

export default function ScanNew() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [stage, setStage] = useState<Stage>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<CompanyInputs | null>(null);
  const [initialScores, setInitialScores] = useState<Scores | null>(null);
  const [initialPillarIdx, setInitialPillarIdx] = useState(0);
  const [resumeSession, setResumeSession] = useState<ScanSessionRow | null>(null);

  useEffect(() => {
    if (!user) return;
    const resumeId = params.get("resume");
    const init = async () => {
      let session: ScanSessionRow | null = null;
      if (resumeId) {
        session = await getSession(resumeId);
      } else {
        session = await getLatestInProgress();
      }
      if (session && session.status === "in_progress") {
        if (resumeId) {
          // direct resume
          loadResume(session);
        } else {
          setResumeSession(session);
          setStage("resume_prompt");
        }
      } else {
        setStage("inputs");
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params]);

  const loadResume = (session: ScanSessionRow) => {
    const scores = deserializeScores(session.pillar_scores);
    const firstIncomplete = PILLARS.findIndex((p) => !isPillarComplete(scores[p.id]));
    setSessionId(session.id);
    setInputs(session.company_inputs);
    setInitialScores(scores);
    setInitialPillarIdx(firstIncomplete === -1 ? 0 : firstIncomplete);
    setStage("pillars");
  };

  const handleInputsComplete = (id: string, ci: CompanyInputs) => {
    setSessionId(id);
    setInputs(ci);
    setStage("pillars");
  };

  const handlePillarsComplete = async (scores: Scores) => {
    if (!sessionId || !inputs) return;
    setStage("finalizing");
    const binding = computeBindingConstraint(scores);
    const impact = computeImpact(inputs);
    await finalizeSession(sessionId, binding, impact, inputs);
    sessionStorage.removeItem("nerve_scan_session_id");
    navigate(`/scan?session=${sessionId}`);
  };

  if (isLoading) return null;
  if (!user) return <Navigate to="/login?redirect=/scan/new" replace />;

  const step: 1 | 2 | 3 = stage === "inputs" || stage === "loading" || stage === "resume_prompt" ? 1 : stage === "pillars" ? 2 : 3;

  return (
    <ScanShell>
      <ScanStepper step={step} />
      {stage === "loading" && (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>Loading…</div>
      )}
      {stage === "resume_prompt" && resumeSession && (
        <ResumePrompt
          session={resumeSession}
          onResume={() => loadResume(resumeSession)}
          onStartNew={() => {
            setResumeSession(null);
            setStage("inputs");
          }}
        />
      )}
      {stage === "inputs" && (
        <InputsStep initial={inputs} onComplete={handleInputsComplete} />
      )}
      {stage === "pillars" && sessionId && (
        <PillarsStep
          sessionId={sessionId}
          initialScores={initialScores}
          initialPillarIdx={initialPillarIdx}
          onComplete={handlePillarsComplete}
        />
      )}
      {stage === "finalizing" && (
        <div style={{ padding: 48, textAlign: "center", color: "#0047AB", fontFamily: "Inter, sans-serif" }}>
          Computing your binding constraint…
        </div>
      )}
    </ScanShell>
  );
}

function ResumePrompt({
  session,
  onResume,
  onStartNew,
}: {
  session: ScanSessionRow;
  onResume: () => void;
  onStartNew: () => void;
}) {
  const date = new Date(session.created_at).toLocaleDateString();
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "0 32px 48px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 520, width: "100%", background: "#EFF6FF", border: "1px solid rgba(0,71,171,0.2)", borderRadius: 16, padding: 32 }}>
        <h2 style={{ fontWeight: 500, fontSize: 18, color: "#0A1628", margin: 0 }}>You have an incomplete scan</h2>
        <p style={{ color: "#1E3A5F", fontSize: 14, marginTop: 8 }}>
          Started on {date}. Pick up where you left off, or start fresh.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button onClick={onResume} style={{ background: "#0047AB", color: "white", padding: "10px 18px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Resume →
          </button>
          <button onClick={onStartNew} style={{ background: "white", color: "#0047AB", padding: "10px 18px", borderRadius: 8, border: "1px solid rgba(0,71,171,0.3)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Start new
          </button>
        </div>
      </div>
    </div>
  );
}
