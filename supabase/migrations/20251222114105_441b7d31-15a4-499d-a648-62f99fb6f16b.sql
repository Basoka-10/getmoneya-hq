-- Add currency_code column to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'EUR';

-- Add currency_code column to quotations table
ALTER TABLE public.quotations
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'EUR';

-- Backfill existing records with user's currency preference
UPDATE public.invoices inv
SET currency_code = COALESCE(
    (SELECT p.currency_preference FROM public.profiles p WHERE p.user_id = inv.user_id),
    'EUR'
)
WHERE inv.currency_code IS NULL OR inv.currency_code = 'EUR';

UPDATE public.quotations q
SET currency_code = COALESCE(
    (SELECT p.currency_preference FROM public.profiles p WHERE p.user_id = q.user_id),
    'EUR'
)
WHERE q.currency_code IS NULL OR q.currency_code = 'EUR';