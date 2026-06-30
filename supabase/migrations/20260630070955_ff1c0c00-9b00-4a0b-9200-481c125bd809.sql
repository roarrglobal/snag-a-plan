
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Skip legacy profile creation for Nerve signups (those carry selected_module metadata)
    IF NULLIF(NEW.raw_user_meta_data->>'selected_module', '') IS NOT NULL THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.profiles (
      user_id,
      display_name,
      user_type,
      subscription_tier,
      subscription_status,
      trial_start_date,
      trial_ends_at,
      trial_expired
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'display_name',
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual'),
      'business',
      'trialing',
      now(),
      now() + interval '15 days',
      false
    );
    RETURN NEW;
END;
$function$;
