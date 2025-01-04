-- Add resume column to profiles table
ALTER TABLE profiles
ADD COLUMN resume TEXT;
ADD COLUMN logo UUID;
ADD COLUMN tagline TEXT;

-- Update RLS policies to include resume field
ALTER POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

ALTER POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

ALTER POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 