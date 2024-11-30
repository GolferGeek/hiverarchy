-- Add system_prompt column to post_developments table
ALTER TABLE post_developments
ADD COLUMN system_prompt TEXT; 