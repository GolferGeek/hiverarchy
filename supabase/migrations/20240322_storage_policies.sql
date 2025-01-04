-- Create policies for interest-images bucket
BEGIN;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Interest images insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Interest images select policy" ON storage.objects;
DROP POLICY IF EXISTS "Interest images update policy" ON storage.objects;
DROP POLICY IF EXISTS "Interest images delete policy" ON storage.objects;

-- Policy for inserting objects
CREATE POLICY "Interest images insert policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (bucket_id = 'interest-images' OR bucket_id = 'interest-images/')
  );

-- Policy for selecting/viewing objects
CREATE POLICY "Interest images select policy" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'interest-images' OR bucket_id = 'interest-images/'
  );

-- Policy for updating objects
CREATE POLICY "Interest images update policy" ON storage.objects
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (bucket_id = 'interest-images' OR bucket_id = 'interest-images/')
  );

-- Policy for deleting objects
CREATE POLICY "Interest images delete policy" ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (bucket_id = 'interest-images' OR bucket_id = 'interest-images/')
  );

COMMIT; 