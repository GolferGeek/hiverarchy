-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update auth settings
ALTER SYSTEM SET auth.jwt.algorithm TO 'HS256';
ALTER SYSTEM SET auth.jwt.secret TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable the auth extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Ensure the auth schema is in the search path
ALTER DATABASE postgres SET search_path TO public, auth, extensions; 