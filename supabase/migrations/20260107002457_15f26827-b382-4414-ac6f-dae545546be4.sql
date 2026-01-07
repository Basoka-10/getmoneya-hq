-- Add currency_code column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN currency_code TEXT DEFAULT 'XOF';

-- Update existing transactions with the user's current currency preference
UPDATE public.transactions t
SET currency_code = COALESCE(
  (SELECT p.currency_preference FROM public.profiles p WHERE p.user_id = t.user_id),
  'XOF'
);