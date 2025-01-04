-- Add content column to interests table
ALTER TABLE interests ADD COLUMN IF NOT EXISTS content TEXT; 