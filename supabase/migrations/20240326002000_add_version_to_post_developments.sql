-- Add version column to post_developments table
ALTER TABLE public.post_developments
ADD COLUMN version integer NOT NULL DEFAULT 1;

-- Add comment to explain the version column
COMMENT ON COLUMN public.post_developments.version IS 'Version number of the development record, starting at 1'; 