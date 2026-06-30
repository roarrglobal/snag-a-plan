import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Target, ArrowRight } from "lucide-react";
import { SnagLogo } from "@/components/SnagLogo";

const VERDICT_MAP: Record<string, { label: string; emoji: string; className: string }> = {
  proceed_confidently: { label: "Proceed with Confidence", emoji: "🟢", className: "verdict-green" },
  proceed_carefully: { label: "Proceed with Caution", emoji: "🟡", className: "verdict-yellow" },
  investigate_first: { label: "Investigate Further", emoji: "🔵", className: "verdict-blue" },
  reconsider_seriously: { label: "Reconsider", emoji: "🔴", className: "verdict-red" },
};

export default function SharedSnagPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (code) fetchSharedSnag(code);
  }, [code]);

  const fetchSharedSnag = async (shortCode: string) => {
    // Fetch shared snag with analysis data
    const { data: shared, error } = await supabase
      .from("shared_snags")
      .select("*, analyses(*)")
      .eq("short_code", shortCode)
      .maybeSingle();

    if (error || !shared) {
      setLoading(false);
      return;
    }

    // Increment view count (rate-limited server-side by IP)
    supabase.functions.invoke("share-view", { body: { short_code: shortCode } }).catch(() => {});

    setData(shared);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Target className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Snag not found</h1>
        <p className="text-sm text-muted-foreground mb-6">This shared analysis may have expired or been removed.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold"
        >
          Try Snag Free
        </button>
      </div>
    );
  }

  const analysis = data.analyses;
  const result = analysis?.result as any;
  const config = data.share_config || {};
  const verdict = result?.bottom_line?.verdict;
  const verdictInfo = verdict ? VERDICT_MAP[verdict] : null;
  const blindSpotsCount = result?.blind_spots?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <SnagLogo size="sm" />
          <span className="text-xs text-muted-foreground">Shared Analysis</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-6 py-12 text-center">
        {/* Verdict */}
        {config.verdict && verdictInfo && (
          <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-white text-sm font-semibold mb-8 ${verdictInfo.className}`}>
            <span>{verdictInfo.emoji}</span>
            <span>{verdictInfo.label}</span>
          </div>
        )}

        {/* Title / Plan */}
        {config.title && (
          <h1 className="text-xl font-bold text-foreground mb-4 leading-relaxed">
            "{analysis?.original_input?.slice(0, 120)}{(analysis?.original_input?.length || 0) > 120 ? "..." : ""}"
          </h1>
        )}

        <div className="w-16 h-px bg-border mx-auto my-6" />

        <p className="text-sm text-muted-foreground mb-2">
          This decision was stress-tested with Snag.
        </p>
        {config.blind_spots_count && (
          <p className="text-sm text-muted-foreground mb-8">
            {blindSpotsCount} potential blind spot{blindSpotsCount !== 1 ? "s" : ""} identified.
          </p>
        )}

        {/* Top blind spot */}
        {config.top_blind_spot && result?.blind_spots?.[0] && (
          <div className="bg-card border border-border rounded-xl p-4 mb-8 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Top Blind Spot</p>
            <p className="text-sm text-foreground">
              {typeof result.blind_spots[0] === "string"
                ? result.blind_spots[0]
                : result.blind_spots[0].blind_spot}
            </p>
          </div>
        )}

        <div className="w-16 h-px bg-border mx-auto my-8" />

        {/* CTA */}
        <h2 className="text-lg font-semibold text-foreground mb-2">
          What decision are you facing?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Stress-test it free with Snag.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="bg-primary text-primary-foreground rounded-xl px-8 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
        >
          Try Snag Free <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Snag · Spot the flaw first
        </p>
      </footer>
    </div>
  );
}
