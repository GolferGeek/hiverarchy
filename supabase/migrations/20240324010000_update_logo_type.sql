-- Update logo column type
BEGIN;

-- First drop the foreign key constraint if it exists
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_logo_fkey;

-- Change logo column type from UUID to TEXT
ALTER TABLE profiles
ALTER COLUMN logo TYPE TEXT USING logo::TEXT;

COMMIT; 