-- Drop existing post_developments table if it exists
DROP TABLE IF EXISTS post_developments CASCADE;

-- Create updated post_developments table
CREATE TABLE public.post_developments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    post_id uuid NULL,
    status text NOT NULL,
    content text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    refutations jsonb NULL,
    research_findings jsonb NULL,
    ideas jsonb NULL,
    post_outline text NULL,
    post_images text[] NULL,
    CONSTRAINT post_developments_pkey PRIMARY KEY (id),
    CONSTRAINT post_developments_post_id_fkey FOREIGN KEY (post_id) 
        REFERENCES posts (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE post_developments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own post developments"
    ON post_developments FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
    ));

CREATE POLICY "Users can insert their own post developments"
    ON post_developments FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
    ));

CREATE POLICY "Users can update their own post developments"
    ON post_developments FOR UPDATE
    USING (auth.uid() IN (
        SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
    ));

CREATE POLICY "Users can delete their own post developments"
    ON post_developments FOR DELETE
    USING (auth.uid() IN (
        SELECT user_id FROM posts WHERE posts.id = post_developments.post_id
    )); 