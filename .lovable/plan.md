## ZERO Module — Full Product Workspace Rebuild

Rebuild `/zero` as a complete authenticated product workspace mirroring the SNAG/Scan architecture, implementing all five stages of the ZERO framework with AI assistance via edge functions.

### Color & Type System
- Primary `#D97706`, Light `#FFFBEB`, Dark `#78350F`, borders `rgba(217,119,6,0.2/0.8)`, Inter throughout.

### Routes
- `/zero` — auth gate (unauth) → workspace dashboard (auth) with left sidebar history + right main
- `/zero/new` — Step 0 decision capture, then 5 stages
- `/zero/new/stage/[1-5]` — stage screens (or single stepper component switching by `stage` query param)
- `/zero/[session_id]` — results view

### Architecture

```text
src/zero/
  ZeroShell.tsx              Sub-header (Amber "ZERO" pill + "+ New examination")
  ZeroSessionList.tsx        Left sidebar history with verdict pills
  ZeroOverview.tsx           Empty state (giant 0) + recent
  ZeroResultsView.tsx        Full results summary + next-step CTAs
  ZeroStepper.tsx            5-stage progress nav
  steps/
    DecisionStep.tsx         Step 0
    Stage1Identification.tsx Inheritance Register + editable belief cards
    Stage2Inference.tsx      Classification + defence statements
    Stage3Inversion.tsx      Adversarial Judge + verdict
    Stage4Ideation.tsx       Traceability Matrix table
    Stage5Integration.tsx    Protocol + sign-off

src/lib/zeroSessions.ts      CRUD + autosave + resume helpers
src/pages/zero/
  ZeroGate.tsx               Unauth landing
  ZeroDashboard.tsx          /zero
  ZeroNew.tsx                /zero/new (hosts stepper)
  ZeroResults.tsx            /zero/[session_id]
```

### Database (migration)
Augment `zero_sessions` (currently 14 cols) with whatever's missing:
- `decision_text text`, `context_text text`, `scan_session_id uuid` (nullable FK)
- `stage1_register jsonb`, `stage2_inference jsonb`, `stage3_inversion jsonb`, `stage4_matrix jsonb`, `stage5_protocol jsonb`
- `overall_verdict text`, `status text default 'in_progress'`
- RLS scoped to `auth.uid()` (read/write/update/delete own rows). GRANT to `authenticated` + `service_role`.

(Will check existing columns first and only ADD what's missing — no data loss.)

### Edge Functions (5 new)
`supabase/functions/zero-stage{1..5}-{generate,classify,invert,ideation,integration}/index.ts`

Each:
- CORS + POST JSON body
- Uses **Lovable AI Gateway** with `google/gemini-2.5-pro` (project standard; no Anthropic key configured — Lovable AI is the supported path)
- System prompts exactly as specified in the brief
- Returns parsed JSON; 402/429/500 handled with clear error payloads

> Note on AI provider: the brief says "Anthropic claude-sonnet-4-6" but this project uses the Lovable AI Gateway (no Anthropic key in secrets). I'll use `google/gemini-2.5-pro` via Lovable AI with identical prompt structure. If you want literal Anthropic, you'd need to add an `ANTHROPIC_API_KEY` secret and I'll swap providers.

### Persistence flow
- Step 0 → `INSERT zero_sessions {status:'in_progress', decision_text, context_text, scan_session_id?}` + cache id in `sessionStorage['nerve_zero_session_id']`
- Each stage's "Continue →" → `UPDATE` with that stage's JSON + bump `status` to `stageN_complete`
- Stage 5 sign-off → compute `overall_verdict`, set `status='completed'`, navigate to results
- Resume: on `/zero/new` entry, if a session is `in_progress`, prompt to resume and jump to the first incomplete stage

### Stage gating logic
- S1 → S2: ≥3 load-bearing beliefs, all load-bearing have named source
- S2 → S3: every load-bearing belief classified + defence written
- S3 → S4: every belief has a verdict + ≥1 AI counter-position generated
- S4 → S5: no SMUGGLED elements remain
- S5 → complete: sign-off checkbox checked

### Overall verdict logic
PROCEED (all key survive) / PROCEED MODIFIED (some modified, none failed) / DO NOT PROCEED (≥1 failed) / INSUFFICIENT EVIDENCE (multiple indeterminate)

### Scan integration
- If `?scan_session_id=...` query present on `/zero/new`, fetch that scan, prefill decision text with binding-constraint sentence and context with evidence strings, show cobalt context banner.
- Results "Open SNAG →" CTA navigates `/analyze?zero_session_id=...` (SNAG side already accepts query context).

### Navigation
- `AppSidebar` ZERO entry becomes a parent group: icon `CircleDashed`, active color `#D97706`, sub-items "New examination" → `/zero/new`, "History" → `/zero`.

### Routing (App.tsx)
- Replace current `/zero` placeholder with the new pages, all under `AppLayout`. `/zero` itself renders `ZeroGate` when unauthenticated, `ZeroDashboard` when authenticated.

### Files
**New (~17):** all of `src/zero/*`, `src/lib/zeroSessions.ts`, 4 `src/pages/zero/*`, 5 edge functions, 1 migration.
**Modified:** `src/App.tsx`, `src/components/layout/AppSidebar.tsx`, `src/integrations/supabase/types.ts` (regen after migration).

### Out of scope (per brief)
`/analyze`, `/scan`, landing page, auth, any other table, any other edge function.

### One confirmation before I build
The brief specifies Anthropic `claude-sonnet-4-6`, but this project has no Anthropic key — only Lovable AI Gateway (Gemini/GPT). I'll default to **`google/gemini-2.5-pro`** via Lovable AI unless you tell me to add an `ANTHROPIC_API_KEY` secret instead.
