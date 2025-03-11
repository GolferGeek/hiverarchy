ALTER TABLE posts
ADD COLUMN completeness integer NOT NULL DEFAULT 3
CHECK (completeness >= 0 AND completeness <= 10); 