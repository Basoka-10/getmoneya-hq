-- Drop the view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.api_keys_safe;

CREATE VIEW public.api_keys_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  name,
  key_prefix,
  is_active,
  created_at,
  last_used_at,
  expires_at
FROM public.api_keys;

-- Grant access to the view
GRANT SELECT ON public.api_keys_safe TO authenticated;

-- Add a comment explaining the security measure
COMMENT ON VIEW public.api_keys_safe IS 'Secure view of api_keys that excludes the key_hash column to prevent exposure of sensitive hash data. Uses SECURITY INVOKER to respect RLS policies of the querying user.';