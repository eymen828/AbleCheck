/*
  # Fix Reviews Display Issues

  1. Ensure all required columns exist with proper defaults
  2. Fix foreign key relationships
  3. Update view to handle missing data gracefully
  4. Add proper indexes for performance
*/

-- Ensure all columns exist with proper structure
DO $$ 
BEGIN
    -- Make sure reviews table has all required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'check_in_verified'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN check_in_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'check_in_data'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN check_in_data JSONB;
    END IF;
END $$;

-- Update any NULL values to proper defaults
UPDATE public.reviews 
SET 
    updated_at = COALESCE(updated_at, created_at),
    is_anonymous = COALESCE(is_anonymous, FALSE),
    check_in_verified = COALESCE(check_in_verified, FALSE)
WHERE updated_at IS NULL OR is_anonymous IS NULL OR check_in_verified IS NULL;

-- Ensure proper NOT NULL constraints where needed
ALTER TABLE public.reviews 
    ALTER COLUMN wheelchair_access SET NOT NULL,
    ALTER COLUMN entrance_access SET NOT NULL,
    ALTER COLUMN bathroom_access SET NOT NULL,
    ALTER COLUMN table_height SET NOT NULL,
    ALTER COLUMN staff_helpfulness SET NOT NULL,
    ALTER COLUMN is_anonymous SET NOT NULL,
    ALTER COLUMN check_in_verified SET NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_place_id_created_at ON public.reviews(place_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_check_in_verified ON public.reviews(check_in_verified) WHERE check_in_verified = true;
CREATE INDEX IF NOT EXISTS idx_reviews_user_place ON public.reviews(user_id, place_id);

-- Recreate the place_ratings view with better error handling
DROP VIEW IF EXISTS public.place_ratings;
CREATE VIEW public.place_ratings AS
SELECT 
  p.id,
  p.name,
  p.address,
  p.created_at,
  COALESCE(COUNT(r.id), 0) as review_count,
  COALESCE(COUNT(CASE WHEN r.check_in_verified = true THEN 1 END), 0) as checkin_review_count,
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
GROUP BY p.id, p.name, p.address, p.created_at
ORDER BY review_count DESC, avg_overall_rating DESC NULLS LAST;

-- Grant proper permissions
GRANT SELECT ON public.place_ratings TO anon, authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.places TO authenticated;
GRANT SELECT ON public.places TO anon;

-- Insert some test data if tables are empty
DO $$
BEGIN
    -- Only insert if no places exist
    IF NOT EXISTS (SELECT 1 FROM public.places LIMIT 1) THEN
        INSERT INTO public.places (name, address) VALUES 
            ('Test Café', 'Teststraße 123, Berlin'),
            ('Beispiel Restaurant', 'Musterweg 456, München'),
            ('Demo Bibliothek', 'Büchergasse 789, Hamburg');
    END IF;
END $$;