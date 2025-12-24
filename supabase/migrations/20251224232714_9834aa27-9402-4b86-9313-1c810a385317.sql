-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view free limits" ON public.free_limits;

-- Create a new policy that only allows authenticated users to view limits
CREATE POLICY "Authenticated users can view free limits" 
ON public.free_limits 
FOR SELECT 
TO authenticated
USING (true);