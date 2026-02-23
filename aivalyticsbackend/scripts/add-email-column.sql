-- Add email column to user table
-- This script adds an email field to the existing user table in Supabase

-- Add email column to the user table
ALTER TABLE "user" 
ADD COLUMN email VARCHAR(255) UNIQUE;

-- Add email validation constraint
ALTER TABLE "user" 
ADD CONSTRAINT email_format_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create index on email for faster lookups
CREATE INDEX idx_user_email ON "user" (email);

-- Add comment to the email column
COMMENT ON COLUMN "user".email IS 'User email address - unique and optional';

-- Optional: Update existing users with placeholder emails (if needed)
-- UPDATE "user" SET email = username || '@example.com' WHERE email IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'email'; 