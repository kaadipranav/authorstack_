-- Add community guidelines acceptance tracking to author_profiles
-- Migration: Add guidelines_accepted_at field

ALTER TABLE author_profiles
ADD COLUMN IF NOT EXISTS guidelines_accepted_at TIMESTAMPTZ;

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS author_profiles_guidelines_accepted_idx 
ON author_profiles(guidelines_accepted_at) 
WHERE guidelines_accepted_at IS NOT NULL;

-- Comment
COMMENT ON COLUMN author_profiles.guidelines_accepted_at IS 'Timestamp when user accepted community guidelines';
