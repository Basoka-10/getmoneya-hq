-- Update API key limits per plan
UPDATE public.api_limits SET max_api_keys = 2 WHERE plan = 'free';
UPDATE public.api_limits SET max_api_keys = 7 WHERE plan = 'pro';
UPDATE public.api_limits SET max_api_keys = 999999 WHERE plan = 'business';