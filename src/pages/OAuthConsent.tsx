import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SnagLogo } from "@/components/SnagLogo";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?redirect=" + encodeURIComponent(next);
        return;
      }
      const { data, error: err } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) {
        setError(err.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-card rounded-xl p-8 border border-border shadow-card">
        <div className="flex justify-center mb-6">
          <SnagLogo size="lg" />
        </div>

        {error ? (
          <>
            <h1 className="text-h3 font-bold text-foreground text-center mb-2">
              Authorization failed
            </h1>
            <p className="text-body-small text-muted-foreground text-center">{error}</p>
          </>
        ) : !details ? (
          <p className="text-body-small text-muted-foreground text-center">Loading…</p>
        ) : (
          <>
            <h1 className="text-h3 font-bold text-foreground text-center mb-2">
              Connect {details.client?.name ?? "an app"}
            </h1>
            <p className="text-body-small text-muted-foreground text-center mb-8">
              {details.client?.name ?? "This client"} will be able to read and act on your Nerve
              workspace as you.
            </p>
            <div className="space-y-3">
              <Button
                disabled={busy}
                onClick={() => decide(true)}
                className="w-full bg-cobalt hover:bg-cobalt-hover text-white"
              >
                {busy ? "Working…" : "Approve"}
              </Button>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() => decide(false)}
                className="w-full"
              >
                Deny
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
