-- Create the ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_name TEXT NOT NULL,
  address TEXT,
  wheelchair_access INTEGER NOT NULL DEFAULT 0 CHECK (wheelchair_access >= 0 AND wheelchair_access <= 5),
  entrance_access INTEGER NOT NULL DEFAULT 0 CHECK (entrance_access >= 0 AND entrance_access <= 5),
  bathroom_access INTEGER NOT NULL DEFAULT 0 CHECK (bathroom_access >= 0 AND bathroom_access <= 5),
  table_height INTEGER NOT NULL DEFAULT 0 CHECK (table_height >= 0 AND table_height <= 5),
  staff_helpfulness INTEGER NOT NULL DEFAULT 0 CHECK (staff_helpfulness >= 0 AND staff_helpfulness <= 5),
  comments TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on ratings" ON public.ratings;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on ratings" ON public.ratings
  FOR ALL USING (true);

-- Create indexes for better performance
DROP INDEX IF EXISTS idx_ratings_created_at;
DROP INDEX IF EXISTS idx_ratings_place_name;

CREATE INDEX idx_ratings_created_at ON public.ratings(created_at DESC);
CREATE INDEX idx_ratings_place_name ON public.ratings(place_name);

-- Insert some sample data for testing
INSERT INTO public.ratings (place_name, address, wheelchair_access, entrance_access, bathroom_access, table_height, staff_helpfulness, comments) 
VALUES 
  ('Café Beispiel', 'Musterstraße 123, Berlin', 4, 5, 3, 4, 5, 'Sehr freundliches Personal, Rampe am Eingang vorhanden.'),
  ('Restaurant Test', 'Hauptstraße 456, München', 3, 4, 4, 3, 4, 'Gute Barrierefreiheit, könnte bei den Tischen besser sein.')
ON CONFLICT (id) DO NOTHING;
