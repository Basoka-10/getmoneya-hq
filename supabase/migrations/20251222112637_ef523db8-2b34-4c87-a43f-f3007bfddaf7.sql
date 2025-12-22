-- Allow owners (admins) to update any invoice/quotation they can see

-- Invoices: owners can update all
CREATE POLICY "Owners can update all invoices"
ON public.invoices
FOR UPDATE
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- Quotations: owners can update all
CREATE POLICY "Owners can update all quotations"
ON public.quotations
FOR UPDATE
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));
