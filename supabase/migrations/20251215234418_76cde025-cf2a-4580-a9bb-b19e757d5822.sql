-- Drop the existing permissive policy on system_settings
DROP POLICY IF EXISTS "Anyone can view system settings" ON public.system_settings;

-- Create a new restrictive policy - only owners can view system settings
CREATE POLICY "Only owners can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (public.is_owner(auth.uid()));

-- Create policy for owners to manage system settings
DROP POLICY IF EXISTS "Owners can manage system settings" ON public.system_settings;
CREATE POLICY "Owners can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (public.is_owner(auth.uid()))
WITH CHECK (public.is_owner(auth.uid()));