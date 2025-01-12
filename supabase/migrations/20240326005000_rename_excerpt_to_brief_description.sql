-- Rename excerpt column to brief_description in posts table
ALTER TABLE public.posts
RENAME COLUMN excerpt TO brief_description;

-- Update comment for the column
COMMENT ON COLUMN public.posts.brief_description IS 'A brief description of the post content'; 