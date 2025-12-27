-- Change default currency from EUR to XOF for profiles
ALTER TABLE public.profiles 
ALTER COLUMN currency_preference SET DEFAULT 'XOF';

-- Change default currency from EUR to XOF for invoices
ALTER TABLE public.invoices 
ALTER COLUMN currency_code SET DEFAULT 'XOF';

-- Change default currency from EUR to XOF for quotations
ALTER TABLE public.quotations 
ALTER COLUMN currency_code SET DEFAULT 'XOF';

-- Change default currency from EUR to XOF for payments
ALTER TABLE public.payments 
ALTER COLUMN currency SET DEFAULT 'XOF';

-- Change default currency from EUR to XOF for subscriptions
ALTER TABLE public.subscriptions 
ALTER COLUMN currency SET DEFAULT 'XOF';