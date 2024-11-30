-- Create post_developments table
CREATE TABLE IF NOT EXISTS post_developments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    original TEXT,                    -- Original concept or idea
    prompt TEXT,                      -- Initial prompt used
    ideas JSONB,                      -- Array of generated ideas and brainstorming results
    learnings JSONB,                  -- Research and learning outcomes
    structure JSONB,                  -- Outline and structure planning
    first_draft TEXT,                 -- Initial content draft
    second_draft TEXT,                -- Revised content
    images JSONB,                     -- Image generation prompts and results
    refutations JSONB,                -- Counter-arguments and considerations
    final_draft TEXT,                 -- Final version of the content
    child_post_ids BIGINT[],         -- Array of related/child post IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    version INTEGER DEFAULT 1,        -- Version tracking
    status TEXT DEFAULT 'draft',      -- Current phase status
    metadata JSONB                    -- Additional metadata (prompts used, tokens, etc.)
);

-- Add RLS policies
ALTER TABLE post_developments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own post developments"
ON post_developments FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM posts 
        WHERE posts.id = post_developments.post_id
    )
);

CREATE POLICY "Users can insert their own post developments"
ON post_developments FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM posts 
        WHERE posts.id = post_developments.post_id
    )
);

CREATE POLICY "Users can update their own post developments"
ON post_developments FOR UPDATE
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM posts 
        WHERE posts.id = post_developments.post_id
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM posts 
        WHERE posts.id = post_developments.post_id
    )
);

CREATE POLICY "Users can delete their own post developments"
ON post_developments FOR DELETE
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM posts 
        WHERE posts.id = post_developments.post_id
    )
);

-- Create indexes
CREATE INDEX idx_post_developments_post_id ON post_developments(post_id);
CREATE INDEX idx_post_developments_status ON post_developments(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_post_developments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_developments_updated_at
    BEFORE UPDATE ON post_developments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_developments_updated_at(); 