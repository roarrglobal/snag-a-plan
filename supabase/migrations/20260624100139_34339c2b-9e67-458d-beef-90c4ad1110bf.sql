ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS gate_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS signal_due_date timestamptz,
  ADD COLUMN IF NOT EXISTS source_module text DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS source_session_id uuid;

ALTER TABLE public.analyses
  DROP CONSTRAINT IF EXISTS analyses_gate_status_check;
ALTER TABLE public.analyses
  ADD CONSTRAINT analyses_gate_status_check
  CHECK (gate_status IN ('active','fired','cleared','expired'));

UPDATE public.analyses
SET signal_due_date = created_at + interval '30 days'
WHERE signal_due_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_analyses_user_gate_status
  ON public.analyses(user_id, gate_status);