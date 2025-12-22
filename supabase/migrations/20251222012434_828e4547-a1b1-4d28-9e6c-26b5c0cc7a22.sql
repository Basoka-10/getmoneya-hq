-- Enable realtime on profiles_private table
ALTER TABLE public.profiles_private REPLICA IDENTITY FULL;

-- Add profiles_private to realtime publication (profiles already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles_private;

-- Allow owners to view all private profiles (for admin user management)
CREATE POLICY "Owners can view all private profiles" 
ON public.profiles_private 
FOR SELECT 
USING (is_owner(auth.uid()));