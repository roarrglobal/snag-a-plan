import { ArrowLeft, Copy, Plus, Check, Share2, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnalysisSection } from "./AnalysisSection";
import { FailureModeItem } from "./FailureModeItem";
import { AnalysisDisclaimer } from "./AnalysisDisclaimer";
import { FirstUseAcknowledgment, useFirstUseAcknowledgment } from "./FirstUseAcknowledgment";
import { ShareModalEnhanced } from "@/components/sharing/ShareModalEnhanced";
import { BottomLineSection, type BottomLine } from "./BottomLineSection";
import { CosmicTimingSection, type CosmicTiming } from "./CosmicTimingSection";
import { exportPreMortemPDF, type PreMortemData } from "@/lib/pdfExport";
import { useAuth } from "@/contexts/AuthContext";

// Simplified analysis result types matching the AI output
export interface BlindSpot {
  blind_spot: string;
  why_it_matters: string;
  how_to_test: string;
}

export interface FailureMode {
  what_fails: string;
  mechanism: string;
  likelihood: "High" | "Medium" | "Low";
  impact: string;
  mitigation: string;
}

export interface WarningSignal {
  signal: string;
  timeframe: string;
}

export interface KillCriterion {
  condition: string;
  action: string;
  threshold: string;
}

export interface AnalysisResult {
  blind_spots: BlindSpot[] | string[];
  failure_modes: FailureMode[] | { what: string; mechanism: string; likelihood: string; impact: string }[];
  warning_signals: WarningSignal[] | string[];
  kill_criteria: KillCriterion[] | string[];
  unasked_question: string;
  bottom_line?: BottomLine;
  category?: string;
  cosmic_timing?: CosmicTiming;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  originalInput: string;
  onNewAnalysis: () => void;
  onSave?: () => void;
  isLoggedIn?: boolean;
  analysisId?: string;
}

// Helper to check if blind spot is enhanced format
const isEnhancedBlindSpot = (spot: BlindSpot | string): spot is BlindSpot => {
  return typeof spot === 'object' && 'blind_spot' in spot;
};

// Helper to check if failure mode is enhanced format
const isEnhancedFailureMode = (mode: any): mode is FailureMode => {
  return typeof mode === 'object' && 'what_fails' in mode;
};

// Helper to check if warning signal is enhanced format
const isEnhancedWarningSignal = (signal: WarningSignal | string): signal is WarningSignal => {
  return typeof signal === 'object' && 'signal' in signal;
};

// Helper to check if kill criterion is enhanced format
const isEnhancedKillCriterion = (criterion: KillCriterion | string): criterion is KillCriterion => {
  return typeof criterion === 'object' && 'condition' in criterion;
};

export function AnalysisResults({
  result,
  originalInput,
  onNewAnalysis,
  onSave,
  isLoggedIn = false,
  analysisId,
}: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();
  const { hasAcknowledged, setHasAcknowledged } = useFirstUseAcknowledgment();
  const { profile } = useAuth();

  // Defensive: ensure arrays exist to prevent .map errors
  const blindSpots = result?.blind_spots || [];
  const failureModes = result?.failure_modes || [];
  const warningSignals = result?.warning_signals || [];
  const killCriteria = result?.kill_criteria || [];

  const handleExportPDF = () => {
    const pdfData: PreMortemData = {
      originalInput,
      blindSpots: blindSpots.map(spot => 
        isEnhancedBlindSpot(spot) ? spot : { blind_spot: spot }
      ),
      failureModes: failureModes.map(mode => 
        isEnhancedFailureMode(mode) 
          ? mode 
          : { what_fails: mode.what, mechanism: mode.mechanism, likelihood: mode.likelihood, impact: (mode as any).impact }
      ),
      warningSignals: warningSignals.map(signal =>
        isEnhancedWarningSignal(signal) ? signal : { signal }
      ),
      killCriteria: killCriteria.map(criteria =>
        isEnhancedKillCriterion(criteria) ? criteria : { condition: criteria, action: "Review and reassess" }
      ),
      unaskedQuestion: result?.unasked_question || "No question generated",
      category: result?.category,
    };

    try {
      exportPreMortemPDF(pdfData, profile?.display_name || undefined);
      toast({
        title: "Report exported",
        description: "Your PDF has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatForCopy = () => {
    const company = (profile as any)?.company_name || profile?.display_name || "Team";
    const summary = originalInput.slice(0, 50);
    const dateStr = new Date().toLocaleDateString();
    const firstGate = killCriteria[0]
      ? (isEnhancedKillCriterion(killCriteria[0])
          ? `${(killCriteria[0] as KillCriterion).condition} → ${(killCriteria[0] as KillCriterion).action}`
          : String(killCriteria[0]))
      : "—";
    const firstAlert = warningSignals[0]
      ? (isEnhancedWarningSignal(warningSignals[0])
          ? (warningSignals[0] as WarningSignal).signal
          : String(warningSignals[0]))
      : "—";

    let text = `${company} SNAG Gate — ${summary}\n`;
    text += `Completed: ${dateStr}\n`;
    text += `Gate criterion: ${firstGate}\n`;
    text += `Alert signal: ${firstAlert}\n\n`;
    text += `---\n\n`;
    text += `DECISION\n${originalInput}\n\n`;

    text += `S — SURFACE (the hidden assumption)\n`;
    result.blind_spots.forEach((spot) => {
      if (isEnhancedBlindSpot(spot)) {
        text += `• ${spot.blind_spot}\n`;
        text += `  Why it matters: ${spot.why_it_matters}\n`;
        text += `  How to test: ${spot.how_to_test}\n\n`;
      } else {
        text += `• ${spot}\n`;
      }
    });
    text += `\n`;

    text += `N — NAME (the failure mode)\n`;
    result.failure_modes.forEach((mode, i) => {
      if (isEnhancedFailureMode(mode)) {
        text += `${i + 1}. ${mode.what_fails}\n`;
        text += `   Mechanism: ${mode.mechanism}\n`;
        text += `   Likelihood: ${mode.likelihood}\n`;
        text += `   Impact: ${mode.impact}\n`;
        text += `   Mitigation: ${mode.mitigation}\n`;
      } else {
        text += `${i + 1}. ${mode.what || (mode as any).what_fails}\n`;
        text += `   Mechanism: ${mode.mechanism}\n`;
        text += `   Likelihood: ${mode.likelihood}\n`;
        text += `   Impact: ${(mode as any).impact || ''}\n`;
      }
      text += `\n`;
    });

    text += `A — ALERT (30-day warning signals)\n`;
    result.warning_signals.forEach((signal) => {
      if (isEnhancedWarningSignal(signal)) {
        text += `• ${signal.signal}`;
        if (signal.timeframe) text += ` [${signal.timeframe}]`;
        text += `\n`;
      } else {
        text += `• ${signal}\n`;
      }
    });
    text += `\n`;

    text += `G — GATE (kill criteria)\n`;
    result.kill_criteria.forEach((criteria) => {
      if (isEnhancedKillCriterion(criteria)) {
        text += `• ${criteria.condition} → ${criteria.action}\n`;
        if (criteria.threshold) text += `  Threshold: ${criteria.threshold}\n`;
      } else {
        text += `• ${criteria}\n`;
      }
    });
    text += `\n`;

    text += `? — THE UNASKED QUESTION\n`;
    text += `"${result.unasked_question}"\n\n`;

    text += `---\nShared via Nerve — Revenue Execution Governance\nnerve.io`;

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatForCopy());
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Analysis copied in plain text format",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {!hasAcknowledged && (
        <FirstUseAcknowledgment onAcknowledged={() => setHasAcknowledged(true)} />
      )}
      
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={onNewAnalysis}
              className="p-2 -ml-2 text-[#666666] hover:text-[#1A1A1A] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[18px] font-bold text-[#1A1A1A]">
              SNAG ANALYSIS
            </span>
            <div className="w-9" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-4 pb-28 max-w-[680px] mx-auto w-full">
          {/* Plan Summary Card */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 mb-4">
            <p className="text-[11px] font-semibold text-[#999999] uppercase tracking-wide mb-2">
              YOUR PLAN
            </p>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              {originalInput}
            </p>
          </div>

        {/* Blind Spots */}
        <AnalysisSection title="S — Surface" subtitle="The hidden assumption your team is making" accentColor="cobalt">
          <ul className="space-y-4">
            {blindSpots.map((spot, i) => (
              <li key={i} className="border-b border-[#F0F0F0] pb-3 last:border-b-0 last:pb-0">
                {isEnhancedBlindSpot(spot) ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0047AB] mt-2 flex-shrink-0" />
                      <span className="text-[15px] font-medium text-[#333333]">{spot.blind_spot}</span>
                    </div>
                    <div className="pl-5 space-y-1">
                      <p className="text-[13px] text-[#666666]">
                        <span className="font-semibold">Why it matters:</span> {spot.why_it_matters}
                      </p>
                      <p className="text-[13px] text-[#666666]">
                        <span className="font-semibold">How to test:</span> {spot.how_to_test}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-[15px] text-[#333333] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#999999] mt-2 flex-shrink-0" />
                    <span>{spot}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </AnalysisSection>

        {/* Failure Modes */}
        <AnalysisSection title="Failure Modes" accentColor="red">
          <div className="space-y-4">
            {failureModes.map((mode, i) => (
              <FailureModeItem 
                key={i} 
                mode={isEnhancedFailureMode(mode) ? {
                  what: mode.what_fails,
                  mechanism: mode.mechanism,
                  likelihood: mode.likelihood,
                  impact: mode.impact,
                  mitigation: mode.mitigation,
                } : mode} 
                index={i + 1} 
              />
            ))}
          </div>
        </AnalysisSection>

        {/* Warning Signals */}
        <AnalysisSection title="Warning Signals" accentColor="amber">
          <ul className="space-y-3">
            {warningSignals.map((signal, i) => (
              <li key={i} className="border-b border-[#F0F0F0] pb-3 last:border-b-0 last:pb-0">
                {isEnhancedWarningSignal(signal) ? (
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 flex-shrink-0" />
                    <span className="text-[15px] text-[#333333]">
                      {signal.signal}
                      {signal.timeframe && (
                        <span className="text-[13px] text-[#666666] ml-2">[{signal.timeframe}]</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-[15px] text-[#333333] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#999999] mt-2 flex-shrink-0" />
                    <span>{signal}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </AnalysisSection>

        {/* Kill Criteria */}
        <AnalysisSection title="Kill Criteria" accentColor="gray">
          <ol className="space-y-3">
            {killCriteria.map((criteria, i) => (
              <li key={i} className="border-b border-[#F0F0F0] pb-3 last:border-b-0 last:pb-0">
                {isEnhancedKillCriterion(criteria) ? (
                  <div className="space-y-1">
                    <div className="flex items-start gap-3">
                      <span className="text-[15px] font-medium text-[#666666] flex-shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-[15px] text-[#333333]">
                        <span className="font-medium">{criteria.condition}</span> → {criteria.action}
                      </span>
                    </div>
                    {criteria.threshold && (
                      <p className="text-[13px] text-[#666666] pl-5">
                        <span className="font-semibold">Threshold:</span> {criteria.threshold}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-[15px] text-[#333333] leading-relaxed">
                    <span className="text-[15px] font-medium text-[#666666] flex-shrink-0">
                      {i + 1}.
                    </span>
                    <span>{criteria}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </AnalysisSection>

        {/* The Unasked Question */}
        <AnalysisSection title="The Unasked Question" accentColor="cobalt">
          <p className="text-[16px] font-medium text-[#1A1A1A] italic leading-relaxed">
            "{result?.unasked_question || "What question haven't you asked yourself?"}"
          </p>
        </AnalysisSection>

        {/* Bottom Line */}
        {result.bottom_line && (
          <BottomLineSection bottomLine={result.bottom_line} />
        )}

        {/* Cosmic Timing - supplementary section */}
        {result.cosmic_timing && (
          <CosmicTimingSection cosmicTiming={result.cosmic_timing} />
        )}

        {/* Disclaimer */}
        <AnalysisDisclaimer />
      </main>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] px-4 py-3 safe-bottom">
        <div className="flex gap-2 max-w-[680px] mx-auto">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F2F2F2] text-[#333333] border border-[#E0E0E0] rounded-lg py-3 min-h-[48px] text-[14px] font-medium transition-colors hover:bg-[#E8E8E8]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F2F2F2] text-[#333333] border border-[#E0E0E0] rounded-lg py-3 min-h-[48px] text-[14px] font-medium transition-colors hover:bg-[#E8E8E8]"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F2F2F2] text-[#333333] border border-[#E0E0E0] rounded-lg py-3 min-h-[48px] text-[14px] font-medium transition-colors hover:bg-[#E8E8E8]"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button
            onClick={onNewAnalysis}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0047AB] text-white rounded-lg py-3 min-h-[48px] text-[14px] font-medium transition-colors hover:bg-[#003A8C]"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {/* Save button - show for logged in users, or prompt login for non-logged in */}
        {onSave && (
          <button
            onClick={onSave}
            className="w-full text-center text-[14px] font-medium text-[#0047AB] mt-2 py-2 hover:underline"
          >
            {isLoggedIn ? "Save to Dashboard" : "Login to Save"}
          </button>
        )}
      </div>
      </div>

      {/* Share Modal */}
      <ShareModalEnhanced
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        planPreview={originalInput.slice(0, 80)}
        blindSpotsCount={blindSpots.length}
        failureModesCount={failureModes.length}
        analysisId={analysisId}
        verdict={result?.bottom_line?.verdict}
      />
    </>
  );
}
