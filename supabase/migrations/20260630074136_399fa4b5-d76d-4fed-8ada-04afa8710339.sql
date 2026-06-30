
ALTER TABLE public.nerve_user_profiles
  ADD COLUMN IF NOT EXISTS signup_notified_at timestamptz;

-- Grant admin to founder so the admin panel is reachable
UPDATE public.nerve_user_profiles
   SET is_admin = true
 WHERE id IN (SELECT id FROM auth.users WHERE lower(email) = 'mahesh@roarrglobal.com');
