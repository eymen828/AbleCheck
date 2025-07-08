-- Add is_checkin field to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_checkin BOOLEAN DEFAULT FALSE;

-- Update existing reviews to have is_checkin = false
UPDATE reviews SET is_checkin = FALSE WHERE is_checkin IS NULL;

-- Create index for better performance when filtering check-in reviews
CREATE INDEX IF NOT EXISTS idx_reviews_is_checkin ON reviews(is_checkin);

-- Create index for compound queries (user + checkin status)
CREATE INDEX IF NOT EXISTS idx_reviews_user_checkin ON reviews(user_id, is_checkin);

-- Optional: Add a comment to document the field
COMMENT ON COLUMN reviews.is_checkin IS 'Indicates if this review was made as a verified check-in (GPS and time verified)';