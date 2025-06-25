-- Fix relationships between tables
DO $$ 
BEGIN
    -- Ensure the profiles table exists and has correct structure
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Ensure reviews table has correct structure
    CREATE TABLE IF NOT EXISTS public.reviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        wheelchair_access INTEGER NOT NULL DEFAULT 0 CHECK (wheelchair_access >= 0 AND wheelchair_access <= 5),
        entrance_access INTEGER NOT NULL DEFAULT 0 CHECK (entrance_access >= 0 AND entrance_access <= 5),
        bathroom_access INTEGER NOT NULL DEFAULT 0 CHECK (bathroom_access >= 0 AND bathroom_access <= 5),
        table_height INTEGER NOT NULL DEFAULT 0 CHECK (table_height >= 0 AND table_height <= 5),
        staff_helpfulness INTEGER NOT NULL DEFAULT 0 CHECK (staff_helpfulness >= 0 AND staff_helpfulness <= 5),
        comments TEXT,
        images TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(place_id, user_id)
    );

    -- Add is_anonymous column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
        UPDATE public.reviews SET is_anonymous = FALSE WHERE is_anonymous IS NULL;
    END IF;

    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles are insertable by owner" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;
    DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
    DROP POLICY IF EXISTS "Reviews are insertable by authenticated users" ON public.reviews;
    DROP POLICY IF EXISTS "Reviews are updatable by owner" ON public.reviews;
    DROP POLICY IF EXISTS "Reviews are deletable by owner" ON public.reviews;
    DROP POLICY IF EXISTS "Places are viewable by everyone" ON public.places;
    DROP POLICY IF EXISTS "Places are insertable by authenticated users" ON public.places;

    -- Create policies
    CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    CREATE POLICY "Profiles are insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    CREATE POLICY "Profiles are updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
    CREATE POLICY "Reviews are insertable by authenticated users" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Reviews are updatable by owner" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Reviews are deletable by owner" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Places are viewable by everyone" ON public.places FOR SELECT USING (true);
    CREATE POLICY "Places are insertable by authenticated users" ON public.places FOR INSERT WITH CHECK (auth.role() = 'authenticated');

END $$;

-- Create or replace the view
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

-- Grant permissions
GRANT SELECT ON public.place_ratings TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.places TO authenticated;

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
