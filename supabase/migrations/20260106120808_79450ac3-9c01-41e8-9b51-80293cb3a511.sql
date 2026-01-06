-- Add category column to invoices table
ALTER TABLE public.invoices
ADD COLUMN category text DEFAULT 'Ventes';

-- Add comment
COMMENT ON COLUMN public.invoices.category IS 'Revenue category for when invoice is marked as paid';