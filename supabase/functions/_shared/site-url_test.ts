import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  DEFAULT_SITE_URL,
  buildAdminUserUrl,
  buildAuthConfirmUrl,
  buildSiteUrl,
  isAllowedOrigin,
  normalizeOrigin,
  resolveSiteUrl,
} from "./site-url.ts";

function clearEnv() {
  Deno.env.delete("SITE_URL");
}

Deno.test("normalizeOrigin strips trailing slash and path", () => {
  assertEquals(normalizeOrigin("https://snagme.app/"), "https://snagme.app");
  assertEquals(normalizeOrigin("https://snagme.app/admin"), "https://snagme.app");
});

Deno.test("normalizeOrigin rejects non-http schemes and creds", () => {
  assertEquals(normalizeOrigin("ftp://snagme.app"), null);
  assertEquals(normalizeOrigin("javascript:alert(1)"), null);
  assertEquals(normalizeOrigin("https://user:pass@snagme.app"), null);
  assertEquals(normalizeOrigin("not-a-url"), null);
});

Deno.test("isAllowedOrigin allows known hosts and preview suffixes", () => {
  assert(isAllowedOrigin("https://snagme.app"));
  assert(isAllowedOrigin("https://www.snagme.app"));
  assert(isAllowedOrigin("http://localhost:8080"));
  assert(isAllowedOrigin("https://id-preview--abc123.lovable.app"));
  assert(isAllowedOrigin("https://fbdbd90a.lovableproject.com"));
});

Deno.test("isAllowedOrigin rejects look-alike and unrelated hosts", () => {
  assert(!isAllowedOrigin("https://snagme.app.evil.com"));
  assert(!isAllowedOrigin("https://evil.com"));
  assert(!isAllowedOrigin("https://snagme-app.com"));
});

Deno.test("resolveSiteUrl prefers a valid SITE_URL env", () => {
  clearEnv();
  Deno.env.set("SITE_URL", "https://snagme.app/");
  const r = resolveSiteUrl();
  assertEquals(r.origin, "https://snagme.app");
  assertEquals(r.source, "env");
  clearEnv();
});

Deno.test("resolveSiteUrl rejects invalid SITE_URL and falls through", () => {
  clearEnv();
  Deno.env.set("SITE_URL", "not-a-url");
  const r = resolveSiteUrl();
  assertEquals(r.origin, DEFAULT_SITE_URL);
  assertEquals(r.source, "fallback");
  assert(r.warnings.some((w) => w.includes("not a valid")));
  clearEnv();
});

Deno.test("resolveSiteUrl rejects non-allowlisted SITE_URL", () => {
  clearEnv();
  Deno.env.set("SITE_URL", "https://attacker.example.com");
  const r = resolveSiteUrl();
  assertEquals(r.origin, DEFAULT_SITE_URL);
  assertEquals(r.source, "fallback");
  assert(r.warnings.some((w) => w.includes("allowlist")));
  clearEnv();
});

Deno.test("resolveSiteUrl falls back to request Origin when env missing", () => {
  clearEnv();
  const req = new Request("https://example.com/x", {
    headers: { origin: "https://id-preview--xyz.lovable.app" },
  });
  const r = resolveSiteUrl(req);
  assertEquals(r.origin, "https://id-preview--xyz.lovable.app");
  assertEquals(r.source, "request");
});

Deno.test("resolveSiteUrl ignores untrusted request Origin", () => {
  clearEnv();
  const req = new Request("https://example.com/x", {
    headers: { origin: "https://attacker.example.com" },
  });
  const r = resolveSiteUrl(req);
  assertEquals(r.origin, DEFAULT_SITE_URL);
  assertEquals(r.source, "fallback");
});

Deno.test("buildSiteUrl joins path and query correctly", () => {
  assertEquals(
    buildSiteUrl("https://snagme.app", "/admin/users/abc"),
    "https://snagme.app/admin/users/abc",
  );
  assertEquals(
    buildSiteUrl("https://snagme.app/", "admin", { tab: "intakes" }),
    "https://snagme.app/admin?tab=intakes",
  );
});

Deno.test("buildAdminUserUrl encodes the user id", () => {
  assertEquals(
    buildAdminUserUrl("https://snagme.app", "abc 123/../etc"),
    "https://snagme.app/admin/users/abc%20123%2F..%2Fetc",
  );
});

Deno.test("buildAuthConfirmUrl produces canonical confirm link", () => {
  assertEquals(
    buildAuthConfirmUrl("https://snagme.app", "tok_abc", "signup"),
    "https://snagme.app/auth/confirm?token_hash=tok_abc&type=signup",
  );
});
