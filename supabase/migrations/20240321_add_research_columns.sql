-- Add research-related columns to post_developments table
ALTER TABLE post_developments
ADD COLUMN research_prompt TEXT,
ADD COLUMN research_results JSONB; 