-- Update images table to use UUID for post_id
BEGIN;

-- Drop existing foreign key constraint
ALTER TABLE images
DROP CONSTRAINT IF EXISTS images_post_id_fkey;

-- Change post_id column type to UUID
ALTER TABLE images
ALTER COLUMN post_id TYPE UUID USING post_id::text::uuid;

-- Add back the foreign key constraint
ALTER TABLE images
ADD CONSTRAINT images_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

COMMIT; 