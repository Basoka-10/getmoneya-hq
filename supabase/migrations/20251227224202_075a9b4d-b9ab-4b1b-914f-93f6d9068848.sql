-- Supprimer les policies owner pour invoices
DROP POLICY IF EXISTS "Owners can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Owners can update all invoices" ON public.invoices;

-- Supprimer les policies owner pour quotations
DROP POLICY IF EXISTS "Owners can view all quotations" ON public.quotations;
DROP POLICY IF EXISTS "Owners can update all quotations" ON public.quotations;