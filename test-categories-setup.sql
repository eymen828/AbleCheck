-- Test Categories Setup
-- This script adds categories to existing places for testing the category filtering

-- First, make sure the categories column exists
ALTER TABLE places ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Update existing places with relevant categories based on their names
-- This is for testing purposes only

-- Update restaurants and cafes
UPDATE places 
SET categories = ARRAY['restaurants', 'cafes']
WHERE LOWER(name) LIKE '%café%' 
   OR LOWER(name) LIKE '%cafe%'
   OR LOWER(name) LIKE '%coffee%'
   OR LOWER(name) LIKE '%kaffee%';

UPDATE places 
SET categories = ARRAY['restaurants', 'restaurants_casual']
WHERE LOWER(name) LIKE '%restaurant%'
   OR LOWER(name) LIKE '%pizzeria%'
   OR LOWER(name) LIKE '%trattoria%';

UPDATE places 
SET categories = ARRAY['restaurants', 'fast_food']
WHERE LOWER(name) LIKE '%mcdonald%'
   OR LOWER(name) LIKE '%burger%'
   OR LOWER(name) LIKE '%kebab%'
   OR LOWER(name) LIKE '%döner%'
   OR LOWER(name) LIKE '%imbiss%';

UPDATE places 
SET categories = ARRAY['restaurants', 'bars_pubs']
WHERE LOWER(name) LIKE '%bar%'
   OR LOWER(name) LIKE '%kneipe%'
   OR LOWER(name) LIKE '%pub%';

-- Update shopping places
UPDATE places 
SET categories = ARRAY['shopping', 'supermarkets']
WHERE LOWER(name) LIKE '%rewe%'
   OR LOWER(name) LIKE '%edeka%'
   OR LOWER(name) LIKE '%aldi%'
   OR LOWER(name) LIKE '%lidl%'
   OR LOWER(name) LIKE '%supermarkt%'
   OR LOWER(name) LIKE '%markt%';

UPDATE places 
SET categories = ARRAY['shopping', 'shopping_centers']
WHERE LOWER(name) LIKE '%center%'
   OR LOWER(name) LIKE '%mall%'
   OR LOWER(name) LIKE '%galerie%'
   OR LOWER(name) LIKE '%passage%';

-- Update healthcare places
UPDATE places 
SET categories = ARRAY['healthcare', 'hospitals']
WHERE LOWER(name) LIKE '%krankenhaus%'
   OR LOWER(name) LIKE '%hospital%'
   OR LOWER(name) LIKE '%klinik%'
   OR LOWER(name) LIKE '%klinikum%';

UPDATE places 
SET categories = ARRAY['healthcare', 'pharmacies']
WHERE LOWER(name) LIKE '%apotheke%'
   OR LOWER(name) LIKE '%pharmacy%';

UPDATE places 
SET categories = ARRAY['healthcare', 'clinics']
WHERE LOWER(name) LIKE '%praxis%'
   OR LOWER(name) LIKE '%arzt%'
   OR LOWER(name) LIKE '%doctor%';

-- Update transportation
UPDATE places 
SET categories = ARRAY['transportation', 'train_stations']
WHERE LOWER(name) LIKE '%bahnhof%'
   OR LOWER(name) LIKE '%station%'
   OR LOWER(name) LIKE '%hauptbahnhof%'
   OR LOWER(name) LIKE '%hbf%';

UPDATE places 
SET categories = ARRAY['transportation', 'bus_stops']
WHERE LOWER(name) LIKE '%bushaltestelle%'
   OR LOWER(name) LIKE '%bus stop%'
   OR LOWER(name) LIKE '%busstop%';

UPDATE places 
SET categories = ARRAY['transportation', 'metro_stations']
WHERE LOWER(name) LIKE '%u-bahn%'
   OR LOWER(name) LIKE '%metro%'
   OR LOWER(name) LIKE '%ubahn%';

-- Update education places
UPDATE places 
SET categories = ARRAY['education', 'schools']
WHERE LOWER(name) LIKE '%schule%'
   OR LOWER(name) LIKE '%school%'
   OR LOWER(name) LIKE '%gymnasium%'
   OR LOWER(name) LIKE '%grundschule%';

UPDATE places 
SET categories = ARRAY['education', 'libraries']
WHERE LOWER(name) LIKE '%bibliothek%'
   OR LOWER(name) LIKE '%library%'
   OR LOWER(name) LIKE '%bücherei%';

UPDATE places 
SET categories = ARRAY['education', 'museums']
WHERE LOWER(name) LIKE '%museum%'
   OR LOWER(name) LIKE '%galerie%'
   OR LOWER(name) LIKE '%ausstellung%';

-- Update services
UPDATE places 
SET categories = ARRAY['services', 'banks']
WHERE LOWER(name) LIKE '%bank%'
   OR LOWER(name) LIKE '%sparkasse%'
   OR LOWER(name) LIKE '%volksbank%';

UPDATE places 
SET categories = ARRAY['services', 'post_offices']
WHERE LOWER(name) LIKE '%post%'
   OR LOWER(name) LIKE '%dhl%'
   OR LOWER(name) LIKE '%paket%';

-- Update entertainment
UPDATE places 
SET categories = ARRAY['entertainment', 'cinemas']
WHERE LOWER(name) LIKE '%kino%'
   OR LOWER(name) LIKE '%cinema%'
   OR LOWER(name) LIKE '%filmtheater%';

UPDATE places 
SET categories = ARRAY['entertainment', 'sports_facilities']
WHERE LOWER(name) LIKE '%fitness%'
   OR LOWER(name) LIKE '%gym%'
   OR LOWER(name) LIKE '%schwimmbad%'
   OR LOWER(name) LIKE '%sporthalle%'
   OR LOWER(name) LIKE '%sportzentrum%';

-- Update accommodation
UPDATE places 
SET categories = ARRAY['accommodation', 'hotels']
WHERE LOWER(name) LIKE '%hotel%'
   OR LOWER(name) LIKE '%pension%'
   OR LOWER(name) LIKE '%gasthaus%';

-- For places that don't match any pattern, assign a generic category based on common words
UPDATE places 
SET categories = ARRAY['services', 'other']
WHERE categories IS NULL 
   AND (LOWER(name) LIKE '%zentrum%' OR LOWER(name) LIKE '%center%');

-- Show results
SELECT 
    name, 
    categories,
    CASE WHEN categories IS NULL THEN 'Keine Kategorien' 
         ELSE array_length(categories, 1)::text || ' Kategorien' 
    END as category_count
FROM places 
ORDER BY categories IS NULL, name
LIMIT 20;

-- Show category statistics
SELECT 
    UNNEST(categories) as category,
    COUNT(*) as count
FROM places 
WHERE categories IS NOT NULL
GROUP BY UNNEST(categories)
ORDER BY count DESC;

COMMIT;