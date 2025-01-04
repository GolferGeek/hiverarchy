-- Create policies for post-images bucket
BEGIN;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Post images insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Post images select policy" ON storage.objects;
DROP POLICY IF EXISTS "Post images update policy" ON storage.objects;
DROP POLICY IF EXISTS "Post images delete policy" ON storage.objects;

-- Policy for inserting objects
CREATE POLICY "Post images insert policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (bucket_id = 'post-images' OR bucket_id = 'post-images/')
  );

-- Policy for selecting/viewing objects
CREATE POLICY "Post images select policy" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'post-images' OR bucket_id = 'post-images/'
  );

-- Policy for updating objects
CREATE POLICY "Post images update policy" ON storage.objects
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (bucket_id = 'post-images' OR bucket_id = 'post-images/')
  );

-- Policy for deleting objects
CREATE POLICY "Post images delete policy" ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (bucket_id = 'post-images' OR bucket_id = 'post-images/')
  );

COMMIT; 