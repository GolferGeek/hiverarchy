-- Create a view to safely access user data
CREATE OR REPLACE VIEW profiles AS
SELECT id, email, raw_user_meta_data
FROM auth.users;

-- Create comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create refutations table
CREATE TABLE refutations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES refutations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add refutations to post_developments if it doesn't exist
ALTER TABLE post_developments
ADD COLUMN IF NOT EXISTS refutations JSONB;

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments"
    ON comments FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT id::text FROM profiles WHERE id = profile_id
    ));

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE USING (auth.uid()::text = (
        SELECT id::text FROM profiles WHERE id = profile_id
    ));

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE USING (auth.uid()::text = (
        SELECT id::text FROM profiles WHERE id = profile_id
    ));

-- Enable RLS on refutations
ALTER TABLE refutations ENABLE ROW LEVEL SECURITY;

-- Refutations policies
CREATE POLICY "Refutations are viewable by everyone"
    ON refutations FOR SELECT USING (true);

CREATE POLICY "Users can insert their own refutations"
    ON refutations FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT id::text FROM profiles WHERE id = profile_id
    ));

CREATE POLICY "Users can update their own refutations"
    ON refutations FOR UPDATE USING (auth.uid()::text = (
        SELECT id::text FROM profiles WHERE id = profile_id
    ));

CREATE POLICY "Users can delete their own refutations"
    ON refutations FOR DELETE USING (auth.uid()::text = (
        SELECT id::text FROM profiles WHERE id = profile_id
    ));

-- Grant access to the profiles view
GRANT SELECT ON profiles TO anon, authenticated; 