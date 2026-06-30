import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching total count:", countError);
      throw countError;
    }

    // Get category distribution
    const { data: categoryData, error: categoryError } = await supabase
      .from("analyses")
      .select("category");

    if (categoryError) {
      console.error("Error fetching categories:", categoryError);
      throw categoryError;
    }

    // Calculate category percentages
    const categoryCounts: Record<string, number> = {
      career: 0,
      business: 0,
      personal: 0,
      travel: 0,
      other: 0,
    };

    categoryData?.forEach((item) => {
      const cat = item.category || "other";
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      } else {
        categoryCounts.other++;
      }
    });

    const total = categoryData?.length || 1;
    const categoryPercentages = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      percentage: Math.round((count / total) * 100) || 0,
    }));

    // Get recent activity count (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount, error: recentError } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneHourAgo);

    if (recentError) {
      console.error("Error fetching recent count:", recentError);
    }

    // Get recent activity types (anonymized - just categories)
    const { data: recentActivities, error: activitiesError } = await supabase
      .from("analyses")
      .select("category, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.error("Error fetching recent activities:", activitiesError);
    }

    const recentActivityTexts = (recentActivities || []).map((a) => {
      const categoryLabels: Record<string, string> = {
        career: "a career move",
        business: "a business decision",
        personal: "a personal choice",
        travel: "a travel plan",
        other: "a decision",
      };
      return `Someone just snagged ${categoryLabels[a.category || "other"] || "a decision"}`;
    });

    // Round counts down to the nearest 50 / 10 to avoid exposing exact volume
    const roundDown = (n: number, step: number) => Math.floor(n / step) * step;
    const safeTotal = roundDown(totalCount || 0, 50);
    const safeRecent = roundDown(recentCount || 0, 10);

    return new Response(
      JSON.stringify({
        totalCount: safeTotal,
        categoryPercentages,
        recentCount: safeRecent,
        // cap to 5 generic items; no timestamps leaked
        recentActivities: recentActivityTexts.slice(0, 5),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Error in get-public-stats:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch stats" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
