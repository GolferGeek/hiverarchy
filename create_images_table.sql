-- Create images table
CREATE TABLE images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert
CREATE POLICY "Users can insert their own images" ON images
    FOR INSERT WITH CHECK (auth.uid() = (
        SELECT user_id FROM posts WHERE id = post_id
    ));

-- Policy to allow authenticated users to select their own images
CREATE POLICY "Users can view their own images" ON images
    FOR SELECT USING (auth.uid() = (
        SELECT user_id FROM posts WHERE id = post_id
    ));

-- Policy to allow authenticated users to update their own images
CREATE POLICY "Users can update their own images" ON images
    FOR UPDATE USING (auth.uid() = (
        SELECT user_id FROM posts WHERE id = post_id
    ));

-- Policy to allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images" ON images
    FOR DELETE USING (auth.uid() = (
        SELECT user_id FROM posts WHERE id = post_id
    ));
