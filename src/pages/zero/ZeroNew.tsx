import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ZeroShell } from "@/zero/ZeroShell";
import { ZeroStepper } from "@/zero/ZeroStepper";
import { DecisionStep } from "@/zero/steps/DecisionStep";
import { Stage1Identification } from "@/zero/steps/Stage1Identification";
import { Stage2Inference } from "@/zero/steps/Stage2Inference";
import { Stage3Inversion } from "@/zero/steps/Stage3Inversion";
import { Stage4Ideation } from "@/zero/steps/Stage4Ideation";
import { Stage5Integration } from "@/zero/steps/Stage5Integration";
import { firstIncompleteStage, getSession, STORAGE_KEY, ZeroSessionRow } from "@/lib/zeroSessions";
import ZeroGate from "./ZeroGate";

export default function ZeroNew() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resumeId = params.get("resume");
  const scanId = params.get("scan_session_id");

  const [session, setSession] = useState<ZeroSessionRow | null>(null);
  const [stage, setStage] = useState<number>(0);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!user || bootstrapped) return;
    (async () => {
      let id = resumeId || sessionStorage.getItem(STORAGE_KEY);
      if (id) {
        const s = await getSession(id);
        if (s && s.status !== "completed" && s.user_id === user.id) {
          setSession(s);
          setStage(firstIncompleteStage(s) > 5 ? 5 : Math.max(1, firstIncompleteStage(s)));
          setBootstrapped(true);
          return;
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setStage(0);
      setBootstrapped(true);
    })();
  }, [user, resumeId, bootstrapped]);

  if (isLoading || !bootstrapped) return null;
  if (!user) return <ZeroGate />;

  const onCreated = async (id: string) => {
    const s = await getSession(id);
    if (s) {
      setSession(s);
      setStage(1);
    }
  };

  const onSaved = (next: ZeroSessionRow) => setSession(next);

  return (
    <ZeroShell>
      {stage === 0 || !session ? (
        <DecisionStep onCreated={onCreated} />
      ) : (
        <>
          <ZeroStepper current={stage} />
          {stage === 1 && (
            <Stage1Identification session={session} onSaved={onSaved} onContinue={() => setStage(2)} />
          )}
          {stage === 2 && (
            <Stage2Inference session={session} onSaved={onSaved} onContinue={() => setStage(3)} />
          )}
          {stage === 3 && (
            <Stage3Inversion session={session} onSaved={onSaved} onContinue={() => setStage(4)} />
          )}
          {stage === 4 && (
            <Stage4Ideation session={session} onSaved={onSaved} onContinue={() => setStage(5)} />
          )}
          {stage === 5 && (
            <Stage5Integration
              session={session}
              onComplete={(id) => {
                sessionStorage.removeItem(STORAGE_KEY);
                navigate(`/zero/${id}`);
              }}
            />
          )}
        </>
      )}
    </ZeroShell>
  );
}
