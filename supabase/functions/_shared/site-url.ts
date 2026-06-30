/**
 * Shared helper: resolve the canonical site origin for outbound links
 * (auth confirmation URLs, admin deep-links, etc.).
 *
 * Precedence:
 *   1. SITE_URL env var (must be a valid absolute https URL).
 *   2. Request `Origin` / `Referer` — only if it matches the allowlist.
 *   3. DEFAULT_SITE_URL fallback.
 *
 * Never returns a value with a trailing slash. Never throws — invalid
 * configuration is logged and the safe fallback is used instead.
 */

export const DEFAULT_SITE_URL = "https://snagme.app";

// Explicit allowlist of permitted environments. Lovable preview hosts use a
// random subdomain, so we match them by suffix.
const ALLOWED_ORIGINS = new Set<string>([
  "https://snagme.app",
  "https://www.snagme.app",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
]);

const ALLOWED_SUFFIXES = [".lovable.app", ".lovableproject.com"];

export interface ResolvedSite {
  origin: string;
  source: "env" | "request" | "fallback";
  warnings: string[];
}

export function isAllowedOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (!/^https?:$/.test(u.protocol)) return false;
    const canonical = `${u.protocol}//${u.host}`;
    if (ALLOWED_ORIGINS.has(canonical)) return true;
    return ALLOWED_SUFFIXES.some((s) => u.hostname.endsWith(s));
  } catch {
    return false;
  }
}

/** Normalize to `scheme://host[:port]` with no trailing slash or path. */
export function normalizeOrigin(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return null;
    // Reject embedded credentials.
    if (u.username || u.password) return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

export function resolveSiteUrl(req?: Request): ResolvedSite {
  const warnings: string[] = [];
  const envRaw = (typeof Deno !== "undefined" ? Deno.env.get("SITE_URL") : undefined) ?? "";

  if (envRaw) {
    const normalized = normalizeOrigin(envRaw);
    if (!normalized) {
      warnings.push(`SITE_URL is not a valid http(s) origin: "${envRaw}"`);
    } else if (!isAllowedOrigin(normalized)) {
      warnings.push(`SITE_URL "${normalized}" is not in the allowlist`);
    } else {
      return { origin: normalized, source: "env", warnings };
    }
  } else {
    warnings.push("SITE_URL env var is not set");
  }

  if (req) {
    const candidates = [req.headers.get("origin"), req.headers.get("referer")].filter(
      Boolean,
    ) as string[];
    for (const c of candidates) {
      const n = normalizeOrigin(c);
      if (n && isAllowedOrigin(n)) {
        return { origin: n, source: "request", warnings };
      }
    }
  }

  return { origin: DEFAULT_SITE_URL, source: "fallback", warnings };
}

/** Build a fully-qualified URL on the resolved site origin. */
export function buildSiteUrl(origin: string, path: string, query?: Record<string, string>): string {
  const base = origin.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(base + cleanPath);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export function buildAdminUserUrl(origin: string, userId: string): string {
  // Defend against path-injection if userId arrives malformed.
  const safeId = encodeURIComponent(userId || "");
  return buildSiteUrl(origin, `/admin/users/${safeId}`);
}

export function buildAuthConfirmUrl(
  origin: string,
  tokenHash: string,
  type: string,
): string {
  return buildSiteUrl(origin, "/auth/confirm", { token_hash: tokenHash, type });
}
