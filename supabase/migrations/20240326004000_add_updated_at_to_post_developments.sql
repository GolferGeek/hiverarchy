-- Add updated_at column to post_developments table
ALTER TABLE public.post_developments
ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_post_developments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_developments_updated_at
    BEFORE UPDATE ON post_developments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_developments_updated_at(); 