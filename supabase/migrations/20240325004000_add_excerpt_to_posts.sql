-- Add excerpt column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS excerpt TEXT; 