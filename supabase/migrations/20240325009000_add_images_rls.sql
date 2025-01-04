-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Policy for inserting images
CREATE POLICY "Users can insert their own post images" ON images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Policy for viewing images
CREATE POLICY "Anyone can view images" ON images
  FOR SELECT
  USING (true);

-- Policy for deleting images
CREATE POLICY "Users can delete their own post images" ON images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id
      AND posts.user_id = auth.uid()
    )
  ); 