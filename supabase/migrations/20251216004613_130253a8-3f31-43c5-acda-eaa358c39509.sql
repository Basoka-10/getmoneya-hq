-- Enable REPLICA IDENTITY FULL for realtime updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.quotations REPLICA IDENTITY FULL;
ALTER TABLE public.invoices REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

-- Add RLS policy for owners to view all profiles (for admin stats)
CREATE POLICY "Owners can view all profiles"
ON public.profiles
FOR SELECT
USING (is_owner(auth.uid()));

-- Add RLS policy for owners to view all quotations (for admin stats)
CREATE POLICY "Owners can view all quotations"
ON public.quotations
FOR SELECT
USING (is_owner(auth.uid()));

-- Add RLS policy for owners to view all invoices (for admin stats)
CREATE POLICY "Owners can view all invoices"
ON public.invoices
FOR SELECT
USING (is_owner(auth.uid()));