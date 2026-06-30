
-- 1. profiles: prevent self-escalation of subscription fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND subscription_tier   IS NOT DISTINCT FROM (SELECT p.subscription_tier   FROM public.profiles p WHERE p.user_id = auth.uid())
    AND subscription_status IS NOT DISTINCT FROM (SELECT p.subscription_status FROM public.profiles p WHERE p.user_id = auth.uid())
    AND trial_expired       IS NOT DISTINCT FROM (SELECT p.trial_expired       FROM public.profiles p WHERE p.user_id = auth.uid())
    AND trial_ends_at       IS NOT DISTINCT FROM (SELECT p.trial_ends_at       FROM public.profiles p WHERE p.user_id = auth.uid())
    AND subscription_ends_at IS NOT DISTINCT FROM (SELECT p.subscription_ends_at FROM public.profiles p WHERE p.user_id = auth.uid())
    AND trial_start_date    IS NOT DISTINCT FROM (SELECT p.trial_start_date    FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- 2. usage: remove user-facing update policy (server-side only)
DROP POLICY IF EXISTS "Users can update their own usage" ON public.usage;

-- 3. notifications: restrict recipient to self or shared-team member
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = actor_id
    AND (
      user_id = auth.uid()
      OR (
        team_id IS NOT NULL
        AND public.is_team_member(team_id, auth.uid())
        AND public.is_team_member(team_id, user_id)
      )
    )
  );

-- 4. waitlist: require authenticated user
DROP POLICY IF EXISTS "Users can join waitlist" ON public.waitlist;
CREATE POLICY "Users can join waitlist"
  ON public.waitlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 5. shared_snags: remove public RPC; add rate-limit table for edge function
REVOKE EXECUTE ON FUNCTION public.increment_share_view(text) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.increment_share_view(text);

CREATE TABLE IF NOT EXISTS public.shared_snag_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code text NOT NULL,
  viewer_ip_hash text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shared_snag_views_lookup
  ON public.shared_snag_views (short_code, viewer_ip_hash, viewed_at DESC);

GRANT ALL ON public.shared_snag_views TO service_role;
ALTER TABLE public.shared_snag_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only"
  ON public.shared_snag_views FOR ALL
  USING (false) WITH CHECK (false);

-- 6. Storage: drop broad avatars listing policy (public URLs still served via CDN)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Owners can list their avatar files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Path traversal helper + harden analysis-uploads policies
CREATE OR REPLACE FUNCTION public.is_valid_storage_path(p_path text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_path IS NULL OR p_user_id IS NULL THEN
    RETURN false;
  END IF;
  IF position('..' in p_path) > 0 THEN RETURN false; END IF;
  IF position('//' in p_path) > 0 THEN RETURN false; END IF;
  IF left(p_path, 1) = '/' THEN RETURN false; END IF;
  RETURN split_part(p_path, '/', 1) = p_user_id::text;
END;
$$;

DROP POLICY IF EXISTS "Users can upload own analysis files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own analysis files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own analysis files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own analysis files" ON storage.objects;

CREATE POLICY "Users can upload own analysis files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'analysis-uploads' AND public.is_valid_storage_path(name, auth.uid()));
CREATE POLICY "Users can view own analysis files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'analysis-uploads' AND public.is_valid_storage_path(name, auth.uid()));
CREATE POLICY "Users can update own analysis files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'analysis-uploads' AND public.is_valid_storage_path(name, auth.uid()));
CREATE POLICY "Users can delete own analysis files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'analysis-uploads' AND public.is_valid_storage_path(name, auth.uid()));

-- 7. Revoke EXECUTE on internal SECURITY DEFINER functions (triggers, auth hooks, RLS helpers)
DO $$
DECLARE
  fn text;
  internal_fns text[] := ARRAY[
    'bump_admin_unread_on_request()',
    'create_nerve_user_profile()',
    'custom_auth_email_hook(jsonb)',
    'handle_new_user()',
    'increment_analysis_usage()',
    'team_decisions_search_update()',
    'update_analyses_updated_at()',
    'update_habit_streak()',
    'update_journal_entry_timestamp()',
    'update_member_activity(uuid, uuid)',
    'update_updated_at_column()',
    'increment_deep_snags_used(uuid)',
    'increment_framework_usage(uuid)',
    'increment_post_mortem_usage(uuid)',
    'increment_retros_used(uuid)',
    'increment_lifetime_usage(uuid, text)',
    'increment_lifetime_usage(text, uuid)',
    'increment_team_snag_usage(uuid, text)',
    'increment_document_usage(uuid, bigint)',
    'is_trial_expired(uuid)',
    'auth_user_email()',
    'is_nerve_admin()'
  ];
BEGIN
  FOREACH fn IN ARRAY internal_fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END LOOP;
END $$;

-- Keep these client-callable: accept_invitation, can_use_feature, check_feature_access,
-- get_invite_details, get_or_create_email_preferences, get_or_create_team_usage,
-- get_or_create_usage, get_team_analytics, get_user_teams, increment_template_usage,
-- search_team_decisions, is_team_admin, is_team_member.
-- Revoke from anon where signed-in only:
DO $$
DECLARE
  fn text;
  auth_only text[] := ARRAY[
    'accept_invitation(text, uuid)',
    'can_use_feature(uuid, text)',
    'check_feature_access(uuid, text)',
    'get_or_create_email_preferences(uuid)',
    'get_or_create_team_usage(uuid)',
    'get_or_create_usage(uuid)',
    'get_team_analytics(uuid, integer)',
    'get_user_teams(uuid)',
    'search_team_decisions(uuid, text, text[], text[], text[], uuid, text[], timestamptz, timestamptz, boolean, text, integer, integer)',
    'increment_template_usage(uuid)'
  ];
BEGIN
  FOREACH fn IN ARRAY auth_only LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END LOOP;
END $$;
