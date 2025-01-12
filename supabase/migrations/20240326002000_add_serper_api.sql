-- Add serper API key column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS api_serper TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN profiles.api_serper IS 'API key for Serper.dev Google search service';

-- Create or update RLS policy to allow users to update their own API keys
DROP POLICY IF EXISTS "Users can update their own API keys" ON profiles;
CREATE POLICY "Users can update their own API keys" 
    ON profiles 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        (
            NEW.api_serper IS NOT NULL OR 
            NEW.api_openai IS NOT NULL OR 
            NEW.api_anthropic IS NOT NULL OR 
            NEW.api_perplexity IS NOT NULL OR 
            NEW.api_grok IS NOT NULL
        )
    ); 