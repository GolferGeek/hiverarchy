-- Begin transaction
BEGIN;

-- Step 1: Drop the RLS policy for post_writer
DROP POLICY IF EXISTS "Users can update their own post_writer" ON posts;

-- Step 2: Remove the post_writer column
ALTER TABLE posts DROP COLUMN IF EXISTS post_writer;

COMMIT; 