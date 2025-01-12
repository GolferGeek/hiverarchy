-- Begin transaction
BEGIN;

-- Step 1: Add post_writer JSON column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_writer JSONB DEFAULT NULL;

-- Step 2: Migrate existing data
UPDATE posts p
SET post_writer = jsonb_build_object(
  'status', pd.status,
  'content', pd.content,
  'version', pd.version,
  'refutations', pd.refutations,
  'research_findings', pd.research_findings,
  'ideas', pd.ideas,
  'post_outline', pd.post_outline,
  'post_images', pd.post_images,
  'created_at', pd.created_at,
  'updated_at', pd.updated_at
)
FROM post_developments pd
WHERE p.id = pd.post_id;

-- Step 3: Add a comment explaining the post_writer field
COMMENT ON COLUMN posts.post_writer IS 'JSON field containing all post development data previously stored in post_developments table';

-- Step 4: Drop post_developments table and its dependencies
DROP TABLE IF EXISTS post_developments CASCADE;

-- Step 5: Add RLS policies for the new post_writer field
DROP POLICY IF EXISTS "Users can update their own post_writer" ON posts;
CREATE POLICY "Users can update their own post_writer" 
    ON posts 
    FOR UPDATE 
    USING (auth.uid() = user_id);

COMMIT;
