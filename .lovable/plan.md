
# Nerve — Full Project Status Report

This is a status snapshot of the entire Nerve platform as it stands today. It covers the marketing surface, the unified access system, the four product modules (PULSE, SCAN, ZERO, SNAG), the legacy B2B Team workspace, the Admin panel, and shared infrastructure (auth, AI, email, security).

---

## 1. Marketing site & landing

**Built**
- `NerveHome` (Section 4 with the 4 module cards + system connector card, per-module color language and staggered animations).
- `MarketingHome`, `Landing`, `ProductPage`, `PricingPage`, `AboutPage`, `BlogPage`, `CareersPage`, `ContactPage`.
- Solution pages: Finance, HR, Marketing, Ops, Personal, Product, Sales, plus `SolutionsPage` index.
- Legal: `Privacy`, `Terms`, `GDPRPage`, `RefundPage`, `Disclaimer`, `SecurityPage`.
- Public stats endpoint (`get-public-stats`) hardened: counts rounded, 5-item activity cap, 60s cache.
- Chat lead capture + `chat-support` edge function.
- SEO via `usePageSEO` hook.

**Missing / weak**
- No published `MarketingHome` content audit since the Nerve repositioning — copy still mixes B2C "Snag" framing on several solution pages.
- No A/B test or analytics events wired into solution pages beyond basic counters.
- Blog has no CMS — entries are hard-coded.

---

## 2. Unified Nerve access system

**Built**
- Tables: `nerve_user_profiles`, `nerve_module_access`, `nerve_intake_forms`.
- Triggers: auto-create profile + per-module access request rows on `auth.users` insert.
- `AuthContext` exposes profile, module-access map, `isAdmin`.
- `ModuleAccessGuard` gates routes by status: requested → onboarding, pending → pending screen, active → allow, suspended → block.
- `Onboarding` and `Pending` pages.
- `nerve-admin-notification` edge function notifies Mahesh on new requests.
- Signup unified (single Nerve account, no module-specific signup).
- `auto_confirm_email = false`, HIBP leaked-password protection on.

**Missing / weak**
- No self-serve "request additional module" UI from an authenticated dashboard — users can only request modules at signup.
- No expiration job for trial access (`expires_at` exists on `nerve_module_access` but nothing automatically suspends).
- No audit row written when admin changes access status.
- Google OAuth provider not configured (project memory says it should be default).

---

## 3. PULSE module (`/pulse`)

**Built**
- `PulseDashboard` page exists as a placeholder shell.

**Missing**
- Entire product. No tables, no edge functions, no input flow, no output, no history. PULSE is the only module without real functionality yet.

---

## 4. SCAN module (`/scan`)

**Built**
- Workspace shell: `ScanDashboard`, `ScanNew`, `ScanReports`, `ScanGate`.
- Component layer: `ScanShell`, `ScanSessionList`, `ScanOverview`, `ScanResultsView`, `InputsStep`, `PillarsStep`.
- Persistence: `scan_sessions` table with `status` (`in_progress` | `completed`), autosave + resume via `src/lib/scanSessions.ts`.
- `scan-notification` edge function (Resend email of results).
- Reports page using Recharts.
- Vitest suite covering serialization, autosave, session creation, resume index.

**Missing / weak**
- No multi-user / team sharing of scan results.
- No PDF export of a scan report (only on-screen view + email).
- Comparison view across scans is not implemented (Reports is single-session).
- No reminder cadence (e.g. quarterly re-scan nudges).

---

## 5. ZERO module (`/zero`)

**Built**
- Workspace: `ZeroDashboard`, `ZeroNew`, `ZeroResults`, `ZeroGate`.
- 5-stage AI flow: `ZeroShell`, `ZeroStepper`, 5 step components.
- 5 edge functions (Lovable AI / `google/gemini-2.5-pro`):
  `zero-stage1-generate`, `zero-stage2-classify`, `zero-stage3-invert`, `zero-stage4-ideation`, `zero-stage5-integration`.
- `zero_sessions` table with 5 stage JSON columns, `onboarding_status`, verdict computation in `src/lib/zeroSessions.ts`.
- Back-linking to scan sessions.

**Missing / weak**
- No collaborative ZERO sessions (single-user only).
- No template library of seeded beliefs by department/role.
- No "publish verdict to team" path into SNAG or Team Decisions.
- No long-running session timeout handling on stuck stages.

---

## 6. SNAG module (`/analyze`) — B2B repositioned

**Built**
- Reframed entirely for B2B revenue leadership (no personal/individual copy).
- CTA: "Gate a decision →".
- `analyze-plan` edge function with updated system prompt.
- `analyses` table extended: `gate_status`, `owner_name`, `signal_due_date`, `source_module`.
- **Gate Registry** at `/analyze/gates`: list view, stats, filter pills, search (decision text / owner / source module), inline status management.
- `ActiveGatesWidget` for the main dashboard.
- Sharing: `shared_snags` + `share-view` edge function with IP rate-limit (5/hour/IP) and `shared_snag_views` audit table.
- Quick-outcome email flow: dedicated `QUICK_OUTCOME_SECRET`, 72h tokens, `quick-outcome` + `schedule-outcome-reminders`.

**Missing / weak**
- Gate lifecycle automation: `signal_due_date` doesn't trigger an automated reminder (no cron job hooked to it yet).
- No bulk import of past decisions into the Gate Registry.
- No CSV export from Gate Registry.
- One-time-use enforcement on quick-outcome tokens (currently expiration-only; still re-usable until expiry).

---

## 7. Legacy B2B Team workspace (`/team/*`)

This is the older B2B product that pre-dates the Nerve module split. Still fully wired.

**Built**
- Teams, members, RBAC (Owner/Admin/Member/Viewer), invitations (`/invite/:token`), team switcher.
- Team Decisions: new/detail/edit, attachments to `analysis-uploads` bucket, visibility (Private/Team/Leadership), comments + @mentions, activity feed, audit log.
- Team templates (wizard + detail), team analytics + insights (unlocked at 5+ outcomes), leaderboard (3+).
- Outcomes: TRACE 5-step log, kill criteria, 30/60/90 check-ins, one-tap outcome emails.
- `team_usage` tracking (200 Deep Snags/mo default).
- Full-text search on `team_decisions` (tsvector).
- B2B onboarding wizard.

**Missing / weak**
- No clear product story tying the Team workspace into the new Nerve module access system — both signup flows still exist.
- Team workspace is not gated by `nerve_module_access` like SCAN/ZERO/SNAG are.

---

## 8. Individual / B2C surfaces (legacy)

**Built**
- `Dashboard`, `DecisionsPage`, `DecisionNewPage`, `DecisionDetailPage`, `DecisionOutcomePage`.
- `JournalPage` + new/detail, `analyze-journal` edge function.
- `PostMortemPage` + new/detail, `analyze-post-mortem` edge function.
- Premortem, SWOT, Porter, Frameworks pages + `framework_analyses` table.
- `HabitsPage` + `habit_completions`, streaks.
- `QuickRetroPage` (60-second retros).
- Mystical readings (paid astrology), `generate-reading`, `mystical_purchases`.
- Profile enrichment / cosmic onboarding.
- `ReportsPage`, `SettingsPage`, `NotificationSettingsPage`, `ProfileSettings`.

**Missing / weak**
- This entire B2C surface is not referenced anywhere in the Nerve module model — unclear whether it ships, gets folded into one of the 4 modules, or gets deprecated.
- Mystical/cosmic features feel out of place against the current B2B Nerve positioning.

---

## 9. Admin panel (`/admin`)

**Built**
- `AdminGuard` (requires `nerve_user_profiles.is_admin = true`).
- `AdminLayout` + `AdminDataContext`.
- Pages: `AdminOverview`, `AdminUsers` (+ `UserDetailPanel` slide-in), `AdminAccessRequests`, `AdminIntakes`, `AdminModules`.
- `nerve-admin` edge function: user management, module activation (with trial period), intake scheduling, automated activation + intake emails.

**Missing / weak**
- No analytics/usage charts in `AdminOverview` (just counts).
- No admin action audit log.
- No bulk-action UI (e.g. approve 10 access requests at once).
- No way to revoke / downgrade module access from the UI flow explicitly (only activate/suspend).

---

## 10. Shared infrastructure

**Built**
- Auth: Supabase, email/password, `auto_confirm_email = false`, HIBP enabled, RLS auth helper `public.auth_user_email()`.
- AI: Lovable AI Gateway, Gemini 2.5 Pro for Deep Snag + ZERO, Flash Lite for Quick Snag.
- Email: Resend via `hello@snagme.app`, `email_queue` + pg_cron, templates for outcomes/reminders.
- Storage: `analysis-uploads` (path-traversal validated), `avatars` (owner-only listing, public CDN reads).
- Security hardening pass complete on the 13 targeted findings (profile escalation, usage escalation, notification spam, waitlist null, share-view rate limit, quick-outcome secret, storage traversal, security-definer EXECUTE grants, HIBP, avatar listing, public stats).
- Test environment: Vitest + Testing Library + jsdom.

**Missing / weak**
- No Google OAuth provider configured.
- No end-to-end (Playwright) test suite in the repo — only Vitest unit tests for scan sessions.
- No `user_roles` table — admin status lives on `nerve_user_profiles.is_admin`, which violates the documented role-table pattern (privilege-escalation risk if profile UPDATE is ever loosened).
- No backup / export tooling beyond per-table CSV.
- No rate limit on AI edge functions (`analyze-plan`, `zero-stage*`, etc.) — abuse risk for paid AI credits.
- No `signal_due_date` cron, no `nerve_module_access.expires_at` cron, no automated trial-expiry job.
- Observability: no error monitoring (Sentry-equivalent) wired up.

---

## Top recommendations (priority order)

1. **Build PULSE** — it's the only module that is purely a placeholder; the landing page promises 4 modules.
2. **Decide the fate of legacy B2C / Team surfaces** — fold into Nerve modules, gate them under `nerve_module_access`, or deprecate. Right now there are two parallel products.
3. **Move `is_admin` off `nerve_user_profiles` into a `user_roles` table** with `has_role()`, per the documented pattern. Today's privileged-field protection is policy-deep but architecturally brittle.
4. **Add AI rate limiting** on the analyze / zero-stage / quick-analyze edge functions.
5. **Wire the dormant cron jobs**: gate `signal_due_date` reminders, module-access `expires_at` suspension, trial expiry.
6. **Configure Google OAuth** (project memory says it should be the default).
7. **One-time-use enforcement** for quick-outcome tokens.

Reply with which area you want me to drill into (or implement first) and I'll switch to build mode for that scope.
