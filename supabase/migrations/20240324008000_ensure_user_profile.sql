-- Ensure user profile exists
BEGIN;

-- Insert the profile if it doesn't exist
INSERT INTO public.profiles (id, email, username)
VALUES (
  'e08f5b74-8343-4798-bc1c-504cc1c274a5',  -- Your user ID
  'your.email@example.com',  -- Will be updated when you sign in
  'user'  -- Will be updated when you set your username
)
ON CONFLICT (id) DO NOTHING;

COMMIT; 