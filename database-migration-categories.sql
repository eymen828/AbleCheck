-- Migration Script: Add Categories Support to AbleCheck Database
-- This script adds category support to the existing places table and updates the place_ratings view

-- Add categories column to places table
ALTER TABLE places ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Update the place_ratings view to include categories
-- First, drop the existing view
DROP VIEW IF EXISTS place_ratings;

-- Recreate the view with categories
CREATE VIEW place_ratings AS
SELECT 
    p.id,
    p.name,
    p.address,
    p.categories,
    p.created_at,
    COUNT(r.id) as review_count,
    ROUND(AVG(r.wheelchair_access), 1) as avg_wheelchair_access,
    ROUND(AVG(r.entrance_access), 1) as avg_entrance_access,
    ROUND(AVG(r.bathroom_access), 1) as avg_bathroom_access,
    ROUND(AVG(r.table_height), 1) as avg_table_height,
    ROUND(AVG(r.staff_helpfulness), 1) as avg_staff_helpfulness,
    ROUND(AVG((r.wheelchair_access + r.entrance_access + r.bathroom_access + r.table_height + r.staff_helpfulness) / 5), 1) as avg_overall_rating
FROM places p
LEFT JOIN reviews r ON p.id = r.place_id
GROUP BY p.id, p.name, p.address, p.categories, p.created_at
ORDER BY p.created_at DESC;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_places_categories ON places USING GIN (categories);

-- Add a comment explaining the categories column
COMMENT ON COLUMN places.categories IS 'Array of category IDs from the frontend category system (restaurants, healthcare, shopping, etc.)';

-- Example of how to query places by category:
-- SELECT * FROM place_ratings WHERE categories && ARRAY['restaurants', 'cafes'];

-- Example of how to add categories to existing places (replace with actual data):
-- UPDATE places SET categories = ARRAY['restaurants', 'cafes'] WHERE name = 'Café Zentral';

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT ON place_ratings TO anon, authenticated;
-- GRANT INSERT, UPDATE ON places TO authenticated;

COMMIT;