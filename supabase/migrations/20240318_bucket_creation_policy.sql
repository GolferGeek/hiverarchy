-- Create policy for bucket creation
BEGIN;

-- Enable RLS on storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow bucket creation for authenticated users" ON storage.buckets;
DROP POLICY IF EXISTS "Allow bucket access for authenticated users" ON storage.buckets;

-- Policy for creating buckets
CREATE POLICY "Allow bucket creation for authenticated users"
ON storage.buckets
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND auth.uid() = (SELECT id FROM auth.users WHERE email = 'golfergeek@gmail.com')
);

-- Policy for accessing buckets
CREATE POLICY "Allow bucket access for authenticated users"
ON storage.buckets
FOR SELECT
USING (true);

COMMIT; 