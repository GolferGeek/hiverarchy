-- Drop existing tables and their dependencies
DROP TABLE IF EXISTS post_developments CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Recreate posts table with UUID
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    arc_id UUID NOT NULL,
    parent_id UUID REFERENCES posts(id),
    interest_ids UUID[] DEFAULT ARRAY[]::UUID[],
    interest_names TEXT[] DEFAULT ARRAY[]::TEXT[],
    tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
    tag_names TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Recreate post_developments table
CREATE TABLE post_developments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_developments ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts"
    ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON posts FOR DELETE USING (auth.uid() = user_id);

-- Create policies for post_developments
CREATE POLICY "Users can view their own post developments"
    ON post_developments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
        )
    );

CREATE POLICY "Users can insert their own post developments"
    ON post_developments FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
        )
    );

CREATE POLICY "Users can update their own post developments"
    ON post_developments FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
        )
    );

CREATE POLICY "Users can delete their own post developments"
    ON post_developments FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
        )
    ); 