-- Add currency preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency_preference TEXT DEFAULT 'EUR';

-- Update RLS policies to allow users to update their own currency preference
-- (Already covered by existing profile update policies)