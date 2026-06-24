import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronRight, 
  Plus, 
  Target, 
  Clock, 
  BarChart3,
  Building2,
  Users,
  FileCheck,
  Lightbulb,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrialBadge } from "@/components/softlaunch/TrialBadge";
import { UsageCounter } from "@/components/softlaunch/UsageCounter";
import { DashboardPatterns } from "@/components/dashboard/DashboardPatterns";
import { DashboardPendingOutcomes } from "@/components/dashboard/DashboardPendingOutcomes";
import { ActiveGatesWidget } from "@/components/dashboard/ActiveGatesWidget";
import type { Json } from "@/integrations/supabase/types";

interface SavedAnalysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
  category: string | null;
}

interface BusinessDashboardProps {
  displayName: string;
  greeting: string;
  softLaunch: {
    limits: {
      deepSnags: { used: number; limit: number };
      journalsPerDay: { used: number; limit: number };
    };
  };
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  career: { bg: "bg-cobalt/10", text: "text-cobalt" },
  business: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  personal: { bg: "bg-violet-500/10", text: "text-violet-600" },
  travel: { bg: "bg-amber-500/10", text: "text-amber-600" },
  other: { bg: "bg-muted", text: "text-muted-foreground" },
};

export function BusinessDashboard({ displayName, greeting, softLaunch }: BusinessDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = useCallback(async () => {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
    
    if (data) setAnalyses(data);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section with Cobalt accent */}
      <section className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-cobalt" />
              <span className="text-xs font-medium text-cobalt uppercase tracking-wide">
                Business Account
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {greeting}, {displayName}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <TrialBadge />
        </div>
        
        {/* Usage counters */}
        <div className="flex items-center gap-4 text-xs">
          <UsageCounter 
            used={softLaunch.limits.deepSnags.used} 
            limit={softLaunch.limits.deepSnags.limit} 
            label="Pre-mortems used" 
          />
        </div>

        {/* Business Focus CTA */}
        <Card className="border-cobalt/20 bg-gradient-to-br from-cobalt/5 to-background">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-cobalt" />
              <span className="text-sm font-medium text-foreground">Strategic Decision Hub</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Run pre-mortems on strategic decisions and build institutional decision memory.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate("/analyze")} 
                className="gap-2 bg-cobalt hover:bg-cobalt/90"
              >
                <Target className="w-4 h-4" />
                Pre-Mortem Analysis
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/post-mortem/new")}
                className="gap-2 border-cobalt/30 text-cobalt hover:bg-cobalt/5"
              >
                <FileCheck className="w-4 h-4" />
                Post-Mortem
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/decisions/new")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Decision
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Business Stats */}
      <section>
        <BusinessQuickStats />
      </section>

      {/* Strategic Frameworks */}
      <section>
        <Card className="border-cobalt/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-cobalt" />
              <h3 className="font-semibold text-foreground">Strategic Frameworks</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Use proven frameworks to analyze complex business decisions.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FrameworkCard 
                title="SWOT Analysis"
                description="Evaluate strengths, weaknesses, opportunities, and threats"
                onClick={() => navigate("/frameworks")}
              />
              <FrameworkCard 
                title="Porter's Five Forces"
                description="Analyze competitive dynamics in your market"
                onClick={() => navigate("/frameworks")}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Business Decision Prompts */}
      <section>
        <Card className="border-dashed">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-cobalt" />
              <h3 className="font-semibold text-foreground">Decision Governance</h3>
            </div>
            <div className="space-y-2">
              <PromptSuggestion 
                text="Should we enter this new market segment?"
                onClick={() => {
                  sessionStorage.setItem("snag_input", "We're considering entering a new market segment. What should we consider?");
                  navigate("/analyze");
                }}
              />
              <PromptSuggestion 
                text="Is this strategic partnership worth pursuing?"
                onClick={() => {
                  sessionStorage.setItem("snag_input", "Should we pursue this strategic partnership opportunity?");
                  navigate("/analyze");
                }}
              />
              <PromptSuggestion 
                text="Run a pre-mortem on Q2 initiatives"
                onClick={() => navigate("/analyze")}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Strategic Analyses */}
      {analyses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Pre-Mortems</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/analyses")}
              className="text-cobalt"
            >
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <RecentAnalysisCard 
                key={analysis.id} 
                analysis={analysis} 
                onClick={() => navigate(`/analysis/${analysis.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Gates */}
      <ActiveGatesWidget />

      {/* Pending Outcomes */}
      <DashboardPendingOutcomes />

      {/* Team Patterns */}
      <DashboardPatterns />

    </div>
  );
}

function BusinessQuickStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    preMortems: 0,
    postMortems: 0,
    decisions: 0,
    outcomes: 0,
  });

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [preMortemsRes, postMortemsRes, decisionsRes, outcomesRes] = await Promise.all([
      supabase.from("analyses").select("*", { count: "exact", head: true }),
      supabase.from("post_mortems").select("*", { count: "exact", head: true }),
      supabase.from("decisions").select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
      supabase.from("decisions").select("*", { count: "exact", head: true })
        .not("outcome_status", "is", null),
    ]);

    setStats({
      preMortems: preMortemsRes.count || 0,
      postMortems: postMortemsRes.count || 0,
      decisions: decisionsRes.count || 0,
      outcomes: outcomesRes.count || 0,
    });
  };

  const items = [
    { label: "Pre-Mortems", value: stats.preMortems, icon: Target, color: "text-cobalt" },
    { label: "Post-Mortems", value: stats.postMortems, icon: FileCheck, color: "text-emerald-600" },
    { label: "Decisions (this month)", value: stats.decisions, icon: Clock, color: "text-amber-600" },
    { label: "Outcomes Tracked", value: stats.outcomes, icon: BarChart3, color: "text-violet-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-border/50">
            <CardContent className="p-4">
              <Icon className={cn("w-5 h-5 mb-2", item.color)} />
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FrameworkCard({ 
  title, 
  description, 
  onClick 
}: { 
  title: string; 
  description: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-3 rounded-lg border border-border hover:border-cobalt/30 hover:bg-cobalt/5 transition-all"
    >
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
    </button>
  );
}

function PromptSuggestion({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg p-2 transition-colors flex items-center gap-2"
    >
      <ChevronRight className="w-4 h-4 text-cobalt" />
      {text}
    </button>
  );
}

function RecentAnalysisCard({ 
  analysis, 
  onClick 
}: { 
  analysis: SavedAnalysis; 
  onClick: () => void;
}) {
  const category = analysis.category || "other";
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const result = analysis.result as { blind_spots?: unknown[]; failure_modes?: unknown[] };
  const blindSpots = result?.blind_spots?.length || 0;
  const failureModes = result?.failure_modes?.length || 0;

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-cobalt/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className={cn(
            "inline-block text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mb-2",
            colors.bg, colors.text
          )}>
            {category}
          </span>
          <p className="text-sm text-foreground line-clamp-2 mb-2">
            {analysis.original_input.slice(0, 100)}
            {analysis.original_input.length > 100 && "..."}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}</span>
            {blindSpots > 0 && (
              <span className="text-cobalt">{blindSpots} blind spot{blindSpots !== 1 ? "s" : ""}</span>
            )}
            {failureModes > 0 && (
              <span className="text-destructive">{failureModes} failure mode{failureModes !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </button>
  );
}
