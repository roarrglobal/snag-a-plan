
-- Extend zero_sessions for the full 5-stage ZERO workspace
ALTER TABLE public.zero_sessions
  ALTER COLUMN pillar_number DROP NOT NULL,
  ALTER COLUMN pillar_name DROP NOT NULL,
  ALTER COLUMN belief_statement DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS decision_text text,
  ADD COLUMN IF NOT EXISTS context_text text,
  ADD COLUMN IF NOT EXISTS stage1_register jsonb,
  ADD COLUMN IF NOT EXISTS stage2_inference jsonb,
  ADD COLUMN IF NOT EXISTS stage3_inversion jsonb,
  ADD COLUMN IF NOT EXISTS stage4_matrix jsonb,
  ADD COLUMN IF NOT EXISTS stage5_protocol jsonb,
  ADD COLUMN IF NOT EXISTS overall_verdict text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'in_progress';

-- Allow users to delete their own zero sessions
DROP POLICY IF EXISTS "Users can delete their own zero sessions" ON public.zero_sessions;
CREATE POLICY "Users can delete their own zero sessions"
  ON public.zero_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.zero_sessions TO authenticated;
GRANT ALL ON public.zero_sessions TO service_role;
