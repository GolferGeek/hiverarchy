-- Add delete policy for interests
CREATE POLICY "Users can delete their own interests"
    ON interests FOR DELETE USING (auth.uid() = user_id); 