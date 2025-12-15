-- 1. Create profiles_private table for sensitive data
CREATE TABLE public.profiles_private (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles_private
ALTER TABLE public.profiles_private ENABLE ROW LEVEL SECURITY;

-- Ultra strict RLS - ONLY the user can see their own private data
CREATE POLICY "Users can view own private profile"
ON public.profiles_private
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own private profile"
ON public.profiles_private
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own private profile"
ON public.profiles_private
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Migrate existing sensitive data from profiles to profiles_private
INSERT INTO public.profiles_private (user_id, email, phone, address)
SELECT user_id, email, phone, address
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Remove sensitive columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS address;

-- 4. Update profiles RLS to be stricter - remove owner bypass for regular viewing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Create secure parameterless is_owner() function
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
$$;

-- 6. Fix activity_logs - Force user_id = auth.uid() via trigger
CREATE OR REPLACE FUNCTION public.set_activity_log_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

-- Create trigger to auto-set user_id
DROP TRIGGER IF EXISTS activity_log_user_trigger ON public.activity_logs;
CREATE TRIGGER activity_log_user_trigger
BEFORE INSERT ON public.activity_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_activity_log_user();

-- 7. Fix activity_logs INSERT policy - strict user_id check
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.activity_logs;
CREATE POLICY "Users can insert their own logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 8. Update handle_new_user to also create profiles_private entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert into profiles (public data only)
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    
    -- Insert into profiles_private (sensitive data)
    INSERT INTO public.profiles_private (user_id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Assign default role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- 9. Add trigger for updated_at on profiles_private
CREATE TRIGGER update_profiles_private_updated_at
BEFORE UPDATE ON public.profiles_private
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();