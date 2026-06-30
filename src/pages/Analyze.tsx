import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisLoading } from "@/components/analysis/AnalysisLoading";
import { AnalysisResults, type AnalysisResult } from "@/components/analysis/AnalysisResults";
import { AnalysisInputSelectors } from "@/components/analysis/AnalysisInputSelectors";
import { UsageWarningBanner } from "@/components/usage/UsageWarningBanner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUsage } from "@/hooks/useUsage";
import { useSoftLaunch } from "@/hooks/useSoftLaunch";
import { WaitlistModal } from "@/components/softlaunch/WaitlistModal";
import LimitReachedModal from "@/components/usage/LimitReachedModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";

export default function Analyze() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { canUseFeature, tier, refetch: refetchUsage } = useUsage();
  const softLaunch = useSoftLaunch();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [sourceJournalId, setSourceJournalId] = useState<string | null>(null);
  
  // New selector states
  const [category, setCategory] = useState("other");
  const [stakes, setStakes] = useState("medium");
  const [timeline, setTimeline] = useState("short");
  const [showOptions, setShowOptions] = useState(false);
  const [includeCosmicInsights, setIncludeCosmicInsights] = useState(false);
  const [userReadings, setUserReadings] = useState<any[]>([]);
  const [hasReadings, setHasReadings] = useState(false);

  // Check if user has purchased readings
  useEffect(() => {
    if (!user) return;
    const fetchReadings = async () => {
      const { data } = await supabase
        .from("mystical_readings")
        .select("reading_type, reading_data")
        .eq("user_id", user.id);
      if (data && data.length > 0) {
        setUserReadings(data);
        setHasReadings(true);
      }
    };
    fetchReadings();
  }, [user]);

  useEffect(() => {
    // Check for prefilled content from journal or decision
    const state = location.state as { 
      prefillContent?: string; 
      sourceJournalId?: string;
      sourceDecisionId?: string;
      autoAnalyze?: boolean;
      category?: string;
      stakes?: string;
    } | null;
    
    if (state?.prefillContent) {
      setInput(state.prefillContent);
      
      if (state.sourceJournalId) {
        setSourceJournalId(state.sourceJournalId);
      }
      
      // Pre-fill category and stakes if provided
      if (state.category) {
        setCategory(state.category);
      }
      if (state.stakes) {
        setStakes(state.stakes);
      }
      
      // Clear location state
      window.history.replaceState({}, document.title);
      
      // Auto-analyze if requested (from decision or journal)
      if (state.autoAnalyze) {
        handleAnalyze(state.prefillContent);
      }
    }
    
    // Check for stored input from landing page
    const storedInput = sessionStorage.getItem("snag_input");
    if (storedInput && !state?.prefillContent) {
      setInput(storedInput);
      sessionStorage.removeItem("snag_input");
      // Auto-start analysis
      handleAnalyze(storedInput);
    }
  }, [location]);

  const handleAnalyze = async (text: string) => {
    // Check soft launch limit first
    if (!softLaunch.canUseDeepSnag) {
      setWaitlistModalOpen(true);
      return;
    }
    
    // Check usage limit before proceeding
    const canAnalyze = await canUseFeature("analysis");
    if (!canAnalyze) {
      setLimitModalOpen(true);
      return;
    }
    
    // Increment soft launch usage
    await softLaunch.incrementDeepSnags();

    setInput(text);
    setIsLoading(true);

    try {
      // Build cosmic data if toggle is on and user has readings
      let cosmicData: any = undefined;
      if (includeCosmicInsights && hasReadings && userReadings.length > 0) {
        cosmicData = {};
        for (const r of userReadings) {
          cosmicData[r.reading_type] = r.reading_data;
        }
      }

      const { data, error } = await supabase.functions.invoke('analyze-plan', {
        body: { plan: text, cosmic_data: cosmicData }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Analysis failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.error) {
        toast({
          title: "Analysis failed",
          description: data.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setResult(data);
      
      // Refetch usage to update the count
      refetchUsage();
      
      // Track usage in localStorage as backup
      const usage = parseInt(localStorage.getItem("snag_usage") || "0");
      localStorage.setItem("snag_usage", String(usage + 1));
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setInput("");
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Create an account to save your analyses",
      });
      navigate("/login");
      return;
    }

    if (!result) return;

    try {
      // Use user-selected category or AI-detected category
      const selectedCategory = category || (result as any).category || "other";
      
      const { error } = await supabase.from("analyses").insert([{
        user_id: user.id,
        original_input: input,
        result: JSON.parse(JSON.stringify(result)),
        title: input.slice(0, 100),
        category: selectedCategory,
      }]);

      if (error) {
        toast({
          title: "Failed to save",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis saved",
          description: "View it in your dashboard",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <AnalysisLoading />;
  }

  if (result) {
    return (
      <AnalysisResults
        result={result}
        originalInput={input}
        onNewAnalysis={handleNewAnalysis}
        onSave={handleSave}
        isLoggedIn={!!user}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ background: "#0A1628", fontFamily: "Inter, sans-serif" }}>
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "#0047AB", textTransform: "uppercase" }}>
            Nerve · SNAG
          </span>
          <div className="w-9" />
        </header>

        {/* Input area */}
        <main className="flex-1 flex flex-col p-4">
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-6">
            {/* Usage Warning */}
            <UsageWarningBanner onUpgrade={() => navigate("/settings")} />

            <h1
              style={{
                fontWeight: 300,
                fontSize: 36,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              SNAG — Decision Gate
            </h1>
            <p
              style={{
                marginTop: 12,
                fontSize: 16,
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              No revenue motion proceeds without clearing the gate.
            </p>

            <h2
              style={{
                marginTop: 40,
                fontSize: 18,
                fontWeight: 500,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              What revenue decision needs to be gated?
            </h2>

            <div className="mt-4">
              <AnalysisInput
                onSubmit={handleAnalyze}
                placeholder="e.g. We are considering changing our enterprise pricing model. No quarter has been missed yet but pipeline conversion is dropping."
              />
            </div>

            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.55,
                textAlign: "center",
              }}
            >
              Describe the revenue motion, decision, or commitment your team is about to make. Be specific about what is being committed and what could go wrong.
            </p>

            {/* Collapsible Options */}
            <Collapsible open={showOptions} onOpenChange={setShowOptions} className="mt-6">
              <CollapsibleTrigger
                className="flex items-center justify-center gap-2 w-full py-2 text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {showOptions ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide options
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Add context (category, stakes, timeline)
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <AnalysisInputSelectors
                  category={category}
                  onCategoryChange={setCategory}
                  stakes={stakes}
                  onStakesChange={setStakes}
                  timeline={timeline}
                  onTimelineChange={setTimeline}
                />

                {hasReadings && (
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,71,171,0.3)" }}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: "#0047AB" }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>Include cosmic insights</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Add timing guidance from your readings</p>
                      </div>
                    </div>
                    <Switch
                      checked={includeCosmicInsights}
                      onCheckedChange={setIncludeCosmicInsights}
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </main>
      </div>


      <LimitReachedModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        limitType="analysis"
        currentTier={tier}
      />
      
      <WaitlistModal
        open={waitlistModalOpen}
        onOpenChange={setWaitlistModalOpen}
        limitType="deep_snag"
      />
    </>
  );
}
