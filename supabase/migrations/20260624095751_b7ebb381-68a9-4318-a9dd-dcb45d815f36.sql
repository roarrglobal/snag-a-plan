CREATE TABLE public.scan_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_email text,
  company_inputs jsonb NOT NULL,
  pillar_scores jsonb NOT NULL,
  binding_constraint jsonb NOT NULL,
  financial_impact jsonb NOT NULL,
  zero_session_id uuid,
  snag_session_id uuid,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.scan_sessions TO authenticated;
GRANT INSERT, SELECT ON public.scan_sessions TO anon;
GRANT ALL ON public.scan_sessions TO service_role;

ALTER TABLE public.scan_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scan sessions"
  ON public.scan_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own scan sessions"
  ON public.scan_sessions FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND guest_email IS NOT NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can update their own scan sessions"
  ON public.scan_sessions FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE INDEX idx_scan_sessions_user_id ON public.scan_sessions(user_id);
CREATE INDEX idx_scan_sessions_guest_email ON public.scan_sessions(guest_email);

CREATE TRIGGER update_scan_sessions_updated_at
  BEFORE UPDATE ON public.scan_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();