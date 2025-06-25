-- Add anonymous option to reviews table (with better error handling)
DO $$ 
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
        
        -- Update existing reviews to be non-anonymous by default
        UPDATE public.reviews SET is_anonymous = FALSE WHERE is_anonymous IS NULL;
    END IF;
END $$;

-- Update the view to handle anonymous reviews
DROP VIEW IF EXISTS public.place_ratings;
CREATE VIEW public.place_ratings AS
SELECT 
  p.id,
  p.name,
  p.address,
  p.created_at,
  COUNT(r.id) as review_count,
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
  ), 0)), 1) as avg_overall_rating
FROM public.places p
LEFT JOIN public.reviews r ON p.id = r.place_id
GROUP BY p.id, p.name, p.address, p.created_at;

-- Grant necessary permissions
GRANT SELECT ON public.place_ratings TO anon, authenticated;
