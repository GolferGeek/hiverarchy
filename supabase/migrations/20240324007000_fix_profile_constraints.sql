-- Add unique constraints to profiles table
BEGIN;

-- Make sure id is unique
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_key,
ADD CONSTRAINT profiles_id_key UNIQUE (id);

-- Make sure username is unique
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_username_key,
ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Add index on id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);

COMMIT; 