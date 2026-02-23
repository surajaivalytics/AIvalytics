-- Migration: Add email column to user table
-- Run this in your Supabase SQL Editor

-- Step 1: Add email column (nullable and unique)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Step 2: Add email format validation
ALTER TABLE "user" 
ADD CONSTRAINT IF NOT EXISTS email_format_check 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user" (email);

-- Step 4: Add column comment
COMMENT ON COLUMN "user".email IS 'User email address - unique and optional';

-- Verification query
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('username', 'email', 'roll_number')
ORDER BY ordinal_position; 