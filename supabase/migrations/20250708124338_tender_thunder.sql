/*
  # Add Check-In Verification to Reviews

  1. Changes
    - Add `check_in_verified` column to reviews table
    - Add `check_in_data` column for storing verification metadata
    - Update existing view to handle check-in reviews
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
    - Add validation for check-in data
*/

-- Add check-in verification columns
DO $$ 
BEGIN
    -- Add check_in_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'check_in_verified'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN check_in_verified BOOLEAN DEFAULT FALSE;
        UPDATE public.reviews SET check_in_verified = FALSE WHERE check_in_verified IS NULL;
    END IF;

    -- Add check_in_data column for storing verification metadata
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'check_in_data'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN check_in_data JSONB;
    END IF;
END $$;

-- Create index for check-in queries
CREATE INDEX IF NOT EXISTS idx_reviews_check_in_verified ON public.reviews(check_in_verified) WHERE check_in_verified = true;
CREATE INDEX IF NOT EXISTS idx_reviews_check_in_data ON public.reviews USING GIN(check_in_data) WHERE check_in_data IS NOT NULL;

-- Update the place_ratings view to prioritize check-in reviews
DROP VIEW IF EXISTS public.place_ratings;
CREATE VIEW public.place_ratings AS
SELECT 
  p.id,
  p.name,
  p.address,
  p.created_at,
  COUNT(r.id) as review_count,
  COUNT(CASE WHEN r.check_in_verified = true THEN 1 END) as checkin_review_count,
  ROUND(AVG(CASE WHEN r.wheelchair_access > 0 THEN r.wheelchair_access END), 1) as avg_wheelchair_access,
  ROUND(AVG(CASE WHEN r.entrance_access > 0 THEN r.entrance_access END), 1) as avg_entrance_access,
  ROUND(AVG(CASE WHEN r.bathroom_access > 0 THEN r.bathroom_access END), 1) as avg_bathroom_access,
  ROUND(AVG(CASE WHEN r.table_height > 0 THEN r.table_height END), 1) as avg_table_height,
  ROUND(AVG(CASE WHEN r.staff_helpfulness > 0 THEN r.staff_helpfulness END), 1) as avg_staff_helpfulness,
  ROUND(AVG((
    CASE WHEN r.wheelchair_access > 0 THEN r.wheelchair_access ELSE 0 END +
    CASE WHEN r.entrance_access > 0 THEN r.entrance_access ELSE 0 END +
    CASE WHEN r.bathroom_access > 0 THEN r.bathroom_access ELSE 0 END +
    CASE WHEN r.table_height > 0 THEN r.table_height ELSE 0 END +
    CASE WHEN r.staff_helpfulness > 0 THEN r.staff_helpfulness ELSE 0 END
  ) / NULLIF((
    CASE WHEN r.wheelchair_access > 0 THEN 1 ELSE 0 END +
    CASE WHEN r.entrance_access > 0 THEN 1 ELSE 0 END +
    CASE WHEN r.bathroom_access > 0 THEN 1 ELSE 0 END +
    CASE WHEN r.table_height > 0 THEN 1 ELSE 0 END +
    CASE WHEN r.staff_helpfulness > 0 THEN 1 ELSE 0 END
  ), 0)), 1) as avg_overall_rating,
  -- Weighted rating that gives more weight to check-in reviews
  ROUND(AVG(
    (CASE WHEN r.wheelchair_access > 0 THEN r.wheelchair_access ELSE 0 END +
     CASE WHEN r.entrance_access > 0 THEN r.entrance_access ELSE 0 END +
     CASE WHEN r.bathroom_access > 0 THEN r.bathroom_access ELSE 0 END +
     CASE WHEN r.table_height > 0 THEN r.table_height ELSE 0 END +
     CASE WHEN r.staff_helpfulness > 0 THEN r.staff_helpfulness ELSE 0 END
    ) / NULLIF((
     CASE WHEN r.wheelchair_access > 0 THEN 1 ELSE 0 END +
     CASE WHEN r.entrance_access > 0 THEN 1 ELSE 0 END +
     CASE WHEN r.bathroom_access > 0 THEN 1 ELSE 0 END +
     CASE WHEN r.table_height > 0 THEN 1 ELSE 0 END +
     CASE WHEN r.staff_helpfulness > 0 THEN 1 ELSE 0 END
    ), 0) * CASE WHEN r.check_in_verified = true THEN 1.2 ELSE 1.0 END
  ), 1) as weighted_avg_rating
FROM public.places p
LEFT JOIN public.reviews r ON p.id = r.place_id
GROUP BY p.id, p.name, p.address, p.created_at;

-- Grant permissions
GRANT SELECT ON public.place_ratings TO anon, authenticated;

-- Function to validate check-in data
CREATE OR REPLACE FUNCTION validate_checkin_data(checkin_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if required fields exist
  IF checkin_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Validate duration (minimum 2 minutes = 120000ms)
  IF (checkin_data->>'duration')::INTEGER < 120000 THEN
    RETURN FALSE;
  END IF;
  
  -- Validate location verification
  IF (checkin_data->>'locationVerified')::BOOLEAN IS NOT TRUE THEN
    RETURN FALSE;
  END IF;
  
  -- Validate position checks (minimum 2 checks)
  IF (checkin_data->>'positionChecks')::INTEGER < 2 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure check-in data is valid when check_in_verified is true
ALTER TABLE public.reviews ADD CONSTRAINT check_valid_checkin_data 
  CHECK (
    (check_in_verified = false) OR 
    (check_in_verified = true AND validate_checkin_data(check_in_data))
  );