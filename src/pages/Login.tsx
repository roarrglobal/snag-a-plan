import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SnagLogo } from "@/components/SnagLogo";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      resolveRedirect(user.id).then((dest) => {
        navigate(dest, { replace: true });
      });
    }
  }, [user, authLoading, navigate, searchParams]);

  const resolveRedirect = async (userId: string) => {
    const redirect = searchParams.get("redirect");
    const pendingInvite = localStorage.getItem("pending_invite_token");

    if (pendingInvite) {
      localStorage.removeItem("pending_invite_token");
      return `/invite/${pendingInvite}`;
    }
    if (redirect) return redirect;

    // Nerve users: skip the legacy team-auto-create path entirely.
    // If the user has any nerve_module_access row, they came through the
    // Nerve signup flow. Route by their primary module / onboarding status.
    let isNerveUser = false;
    try {
      const { data: nerveAccess } = await supabase
        .from("nerve_module_access")
        .select("module, status")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      if (nerveAccess) isNerveUser = true;
    } catch {
      // ignore — fall through to legacy logic
    }

    if (isNerveUser) {
      try {
        const { data: profile } = await supabase
          .from("nerve_user_profiles")
          .select("primary_module, onboarding_status")
          .eq("id", userId)
          .maybeSingle();
        if (profile?.onboarding_status && profile.onboarding_status !== "active") {
          return profile.onboarding_status === "pending_review" ||
            profile.onboarding_status === "intake_scheduled" ||
            profile.onboarding_status === "intake_complete"
            ? "/pending"
            : "/onboarding";
        }
        const mod = profile?.primary_module;
        if (mod === "scan") return "/scan";
        if (mod === "zero") return "/zero";
        if (mod === "snag") return "/analyze";
        if (mod === "pulse") return "/pulse";
      } catch {
        // fall through
      }
      return "/dashboard";
    }

    // Legacy users only beyond this point.
    // Check if user belongs to a team → redirect to team dashboard.
    try {
      const { data: membership } = await supabase
        .from("team_members")
        .select("team_id, teams(slug)")
        .eq("user_id", userId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (membership?.teams && typeof membership.teams === "object" && "slug" in membership.teams) {
        return `/team/${(membership.teams as any).slug}/dashboard`;
      }
    } catch {
      // fallback
    }

    // Legacy business user with no team and no Nerve access — auto-create team.
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const userType = currentUser?.user_metadata?.user_type;
      const pendingTeamName = currentUser?.user_metadata?.pending_team_name;

      if (userType === "business" && pendingTeamName) {
        const slug = pendingTeamName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .substring(0, 50) || `team-${Date.now()}`;

        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: pendingTeamName,
            slug,
            owner_id: userId,
          })
          .select()
          .single();

        if (!teamError && newTeam) {
          await supabase.from("team_members").insert({
            team_id: newTeam.id,
            user_id: userId,
            role: "owner",
            status: "active",
            joined_at: new Date().toISOString(),
          });

          await supabase.auth.updateUser({
            data: { pending_team_name: null },
          });

          return `/team/${slug}/dashboard`;
        }
      }
    } catch {
      // fallback to individual dashboard
    }

    return "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : error.message,
          variant: "destructive",
        });
      } else {
        const { data: { user: signedInUser } } = await supabase.auth.getUser();
        const dest = await resolveRedirect(signedInUser?.id || "");
        navigate(dest, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-xl p-8 border border-border shadow-card">
          <Link to="/" className="flex justify-center mb-6">
            <SnagLogo size="lg" />
          </Link>

          <h2 className="text-h3 font-bold text-foreground text-center mb-2">Welcome back</h2>
          <p className="text-body-small text-muted-foreground text-center mb-8">
            Sign in to access your analyses
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-caption font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-caption font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-caption text-muted-foreground hover:text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-cobalt hover:bg-cobalt-hover text-white">
              {isLoading ? "Signing in..." : "Log In"}
            </Button>
          </form>

          <p className="text-body-small text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
