## Scan Module Rebuild — Product Workspace

Convert `/scan` from a standalone diagnostic flow into an authenticated product workspace mirroring SNAG's architecture (dashboard + history + session input + output), using the Cobalt color system.

### Routes

| Route | Purpose |
|---|---|
| `/scan` | Auth-gated dashboard. Unauth → landing gate. |
| `/scan/new` | 3-step session flow (Inputs → Pillars → Results). |
| `/scan/reports` | Aggregate trends (2+ sessions required). |

The old `/scan/diagnostic`, `/scan/results`, `/scan/inputs`, `/scan/gate` routes are removed.

### Shell

New `ScanShell` wraps all `/scan/*` routes inside the existing authed `AppLayout`. 56px sub-header below the main nav:
- Left: "SCAN" Cobalt pill + "Revenue Structure Diagnostic" subtitle.
- Right: "+ New Scan" Cobalt button → `/scan/new`.

### Unauth gate

When a visitor hits `/scan` without a session, render a centered landing card (white canvas, Cobalt pill, large H1, body copy, primary "Create free account" → `/signup?module=scan`, secondary "Sign in" → `/login?redirect=/scan`). No email capture, no guest mode.

### Dashboard `/scan`

Two-column layout:

**Left sidebar (280px)** — `ScanSessionList`
- "Scan History" header + "+ New Scan" link.
- Session rows: binding pillar name (truncated 28ch), `$ARR · X ago`, right-side score chip colored green/amber/crimson by score band.
- Empty state: "No scans yet" + CTA.

**Right main** — three states:
1. No sessions → giant "8" hero + CTA.
2. Sessions exist, none selected → "Your Revenue System Overview" with 4 stat cards (count, most common constraint, latest score, trend ↑/↓) + recent sessions table (5 rows).
3. Session selected → inline results view (same component as Step 3).

Selection is URL-driven: `/scan?session=<id>`.

### New session `/scan/new`

Horizontal stepper (Inputs · Pillars · Results) in Cobalt.

- **Step 1** — `ScanInputsStep`: 7-field form in a white card. On submit, INSERT `scan_sessions` row (`status='in_progress'`, `company_inputs` filled), store id in `sessionStorage['nerve_scan_session_id']`, advance.
- **Step 2** — `ScanPillarsStep`: reuse existing pillar UX (sliders, evidence, live radar). After each pillar is fully scored, autosave `pillar_scores` JSON to the active session row.
- **Step 3** — `ScanResultsStep`: compute binding + impact, UPDATE row with `binding_constraint`, `financial_impact`, `status='completed'`, then redirect to `/scan?session=<id>`.

**Resume**: on entering `/scan/new`, query for the user's latest `status='in_progress'` row. If found, show a prompt "You have an incomplete scan from [date]. Resume / Start new". Resume jumps to the first incomplete pillar.

### Reports `/scan/reports`

Three Recharts panels (Cobalt):
1. Bar — constraint frequency by pillar.
2. Line — binding constraint score over time.
3. Line — total financial impact over time.

If <2 completed sessions, show "Run at least two scans to see trends."

### Persistence

Uses the existing `scan_sessions` table. One schema addition needed:

```sql
ALTER TABLE public.scan_sessions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed';
-- status ∈ 'in_progress' | 'completed'
```

(Existing `completed` boolean stays; new `status` drives resume/dashboard filtering.)

Helper module `src/lib/scanSessions.ts`:
- `createInProgressSession(companyInputs)`
- `autosavePillarScores(id, pillarScores)`
- `finalizeSession(id, binding, impact)`
- `listSessions(userId)` / `getSession(id)` / `getInProgressForUser()`

The existing `saveScanSession.ts` is replaced by these helpers; the notification fire-and-forget moves into `finalizeSession`.

### Navigation

`AppSidebar` Scan item becomes a parent group with sub-items "New Scan" (`/scan/new`) and "Reports" (`/scan/reports`); parent link goes to `/scan`. Icon `ScanLine`, Cobalt active state.

### Files

**New**
- `src/scan/ScanShell.tsx` — sub-header chrome (white, Cobalt).
- `src/scan/ScanSessionList.tsx` — sidebar history.
- `src/scan/ScanOverview.tsx` — stat cards + recent table.
- `src/scan/ScanResultsView.tsx` — extracted inline results renderer (used by dashboard + step 3).
- `src/scan/ScanStepper.tsx` — 3-step indicator.
- `src/scan/steps/InputsStep.tsx`
- `src/scan/steps/PillarsStep.tsx` (refactor of existing `ScanDiagnostic.tsx` content, white canvas + Cobalt, with autosave).
- `src/scan/steps/ResultsStep.tsx`
- `src/lib/scanSessions.ts`
- `src/pages/scan/ScanDashboard.tsx` (replaces `ScanEntry.tsx`)
- `src/pages/scan/ScanNew.tsx`
- `src/pages/scan/ScanReports.tsx`
- `supabase/migrations/<ts>_scan_sessions_status.sql`

**Modified**
- `src/App.tsx` — replace `/scan/*` routes (remove old children, add new ones, all under `AppLayout`).
- `src/components/layout/AppSidebar.tsx` — Scan parent + 2 sub-items, `ScanLine` icon.

**Removed**
- `src/pages/scan/ScanEntry.tsx`
- `src/pages/scan/ScanGate.tsx`
- `src/pages/scan/ScanInputs.tsx`
- `src/pages/scan/ScanDiagnostic.tsx`
- `src/pages/scan/ScanResults.tsx`
- `src/lib/saveScanSession.ts`
- `src/scan/NerveShell.tsx` references inside `/scan` (kept if used elsewhere; replaced here by `ScanShell`).

### Out of scope (untouched)

`/analyze` (SNAG), `/zero`, landing page, auth flow, all other Supabase tables, the `scan-notification` edge function (still invoked from `finalizeSession`).

### Confirmations needed

1. The old guest/email-capture flow (`nerve_scan_email`, `nerve_scan_guest`) is fully retired — Scan becomes auth-only like SNAG. OK?
2. Adding a `status` text column to `scan_sessions` (one DB migration). OK?
