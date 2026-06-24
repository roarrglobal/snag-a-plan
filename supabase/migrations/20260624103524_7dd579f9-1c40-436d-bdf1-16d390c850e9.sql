
CREATE TABLE public.zero_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_email text,
  scan_session_id uuid REFERENCES public.scan_sessions(id) ON DELETE SET NULL,
  pillar_number integer NOT NULL,
  pillar_name text NOT NULL,
  belief_statement text NOT NULL,
  origin_selection text,
  classification text,
  counter_position_response text,
  verdict text,
  modification_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.zero_sessions TO authenticated;
GRANT INSERT ON public.zero_sessions TO anon;
GRANT ALL ON public.zero_sessions TO service_role;

ALTER TABLE public.zero_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own zero sessions"
  ON public.zero_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own zero sessions"
  ON public.zero_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own zero sessions"
  ON public.zero_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guests can insert zero sessions with email"
  ON public.zero_sessions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

CREATE INDEX idx_zero_sessions_user ON public.zero_sessions(user_id);
CREATE INDEX idx_zero_sessions_scan ON public.zero_sessions(scan_session_id);

CREATE TRIGGER update_zero_sessions_updated_at
  BEFORE UPDATE ON public.zero_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
