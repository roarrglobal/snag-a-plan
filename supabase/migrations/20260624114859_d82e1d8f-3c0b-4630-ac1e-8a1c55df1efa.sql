
ALTER TABLE public.nerve_user_profiles
  ADD COLUMN IF NOT EXISTS unread_admin_notifications integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calendly_url text;

-- Allow admins to insert module-access rows for any user
DROP POLICY IF EXISTS module_access_admin_insert ON public.nerve_module_access;
CREATE POLICY module_access_admin_insert ON public.nerve_module_access
  FOR INSERT TO authenticated
  WITH CHECK (public.is_nerve_admin());

-- Trigger: bump unread counter for every admin on new request
CREATE OR REPLACE FUNCTION public.bump_admin_unread_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'requested' THEN
    UPDATE public.nerve_user_profiles
       SET unread_admin_notifications = unread_admin_notifications + 1
     WHERE is_admin = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_admin_unread ON public.nerve_module_access;
CREATE TRIGGER trg_bump_admin_unread
AFTER INSERT ON public.nerve_module_access
FOR EACH ROW EXECUTE FUNCTION public.bump_admin_unread_on_request();
