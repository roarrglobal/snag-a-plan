
-- ============ Helper: updated_at trigger (reuse existing public.update_updated_at_column) ============

-- ============ TABLE: nerve_user_profiles ============
CREATE TABLE public.nerve_user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  job_title text,
  team_size text CHECK (team_size IN ('solo','2-10','11-50','50+')),
  primary_module text CHECK (primary_module IN ('pulse','scan','zero','snag')),
  onboarding_status text NOT NULL DEFAULT 'pending_review'
    CHECK (onboarding_status IN ('pending_review','intake_scheduled','intake_complete','active','suspended')),
  is_admin boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.nerve_user_profiles TO authenticated;
GRANT ALL ON public.nerve_user_profiles TO service_role;

ALTER TABLE public.nerve_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER nerve_user_profiles_updated_at
  BEFORE UPDATE ON public.nerve_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin helper (must be defined before policies that reference it)
CREATE OR REPLACE FUNCTION public.is_nerve_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.nerve_user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Policies: nerve_user_profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.nerve_user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_nerve_admin());

CREATE POLICY "profiles_update_own_limited" ON public.nerve_user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent users from changing protected columns
    AND onboarding_status = (SELECT onboarding_status FROM public.nerve_user_profiles WHERE id = auth.uid())
    AND is_admin = (SELECT is_admin FROM public.nerve_user_profiles WHERE id = auth.uid())
    AND primary_module IS NOT DISTINCT FROM (SELECT primary_module FROM public.nerve_user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_admin_update_all" ON public.nerve_user_profiles
  FOR UPDATE TO authenticated
  USING (public.is_nerve_admin())
  WITH CHECK (public.is_nerve_admin());

-- INSERT is handled by trigger (SECURITY DEFINER), but allow admin manual inserts
CREATE POLICY "profiles_admin_insert" ON public.nerve_user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_nerve_admin());


-- ============ TABLE: nerve_module_access ============
CREATE TABLE public.nerve_module_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module text NOT NULL CHECK (module IN ('pulse','scan','zero','snag')),
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','pending_intake','active','suspended','trial')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  activated_by uuid REFERENCES auth.users(id),
  trial_expires_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module)
);

GRANT SELECT, INSERT ON public.nerve_module_access TO authenticated;
GRANT UPDATE ON public.nerve_module_access TO authenticated; -- restricted by RLS to admins only
GRANT ALL ON public.nerve_module_access TO service_role;

ALTER TABLE public.nerve_module_access ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER nerve_module_access_updated_at
  BEFORE UPDATE ON public.nerve_module_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "module_access_select_own_or_admin" ON public.nerve_module_access
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_nerve_admin());

-- Users may insert only their own row, status forced to 'requested'
CREATE POLICY "module_access_insert_own_requested" ON public.nerve_module_access
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'requested'
    AND activated_at IS NULL
    AND activated_by IS NULL
  );

-- Only admins can update
CREATE POLICY "module_access_admin_update" ON public.nerve_module_access
  FOR UPDATE TO authenticated
  USING (public.is_nerve_admin())
  WITH CHECK (public.is_nerve_admin());


-- ============ TABLE: nerve_intake_forms ============
CREATE TABLE public.nerve_intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modules_requested text[] NOT NULL DEFAULT ARRAY[]::text[],
  current_situation text NOT NULL,
  company_arr text,
  team_context text,
  how_found text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.nerve_intake_forms TO authenticated;
GRANT UPDATE ON public.nerve_intake_forms TO authenticated; -- restricted to admin by RLS
GRANT ALL ON public.nerve_intake_forms TO service_role;

ALTER TABLE public.nerve_intake_forms ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER nerve_intake_forms_updated_at
  BEFORE UPDATE ON public.nerve_intake_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "intake_select_own_or_admin" ON public.nerve_intake_forms
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_nerve_admin());

CREATE POLICY "intake_insert_own" ON public.nerve_intake_forms
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "intake_admin_update" ON public.nerve_intake_forms
  FOR UPDATE TO authenticated
  USING (public.is_nerve_admin())
  WITH CHECK (public.is_nerve_admin());


-- ============ TRIGGER: create Nerve profile + module request on signup ============
CREATE OR REPLACE FUNCTION public.create_nerve_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primary_mod text;
BEGIN
  INSERT INTO public.nerve_user_profiles (id, full_name, company_name, team_size, primary_module)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'team_size', ''),
    NULLIF(NEW.raw_user_meta_data->>'selected_module', '')
  )
  ON CONFLICT (id) DO NOTHING;

  primary_mod := NULLIF(NEW.raw_user_meta_data->>'selected_module', '');
  IF primary_mod IN ('pulse','scan','zero','snag') THEN
    INSERT INTO public.nerve_module_access (user_id, module, status)
    VALUES (NEW.id, primary_mod, 'requested')
    ON CONFLICT (user_id, module) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_nerve ON auth.users;
CREATE TRIGGER on_auth_user_created_nerve
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_nerve_user_profile();

-- ============ Backfill profiles for existing users ============
INSERT INTO public.nerve_user_profiles (id, full_name, company_name)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'display_name', ''),
  COALESCE(u.raw_user_meta_data->>'company_name', '')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
