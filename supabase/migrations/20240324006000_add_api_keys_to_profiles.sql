-- Add API key columns to profiles table
ALTER TABLE profiles
ADD COLUMN api_openai TEXT,
ADD COLUMN api_anthropic TEXT,
ADD COLUMN api_grok TEXT,
ADD COLUMN api_perplexity TEXT;

-- Update RLS policies to include API key fields
ALTER POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

ALTER POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

ALTER POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 