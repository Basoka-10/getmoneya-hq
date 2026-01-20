-- Drop existing policies and recreate for api_limits
DROP POLICY IF EXISTS "Anyone can view API limits" ON public.api_limits;
DROP POLICY IF EXISTS "Authenticated users can view API limits" ON public.api_limits;

-- Create new policy: only authenticated users can view API limits
CREATE POLICY "Authenticated users can view API limits"
ON public.api_limits
FOR SELECT
TO authenticated
USING (true);