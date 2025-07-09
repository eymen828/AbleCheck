/*
  # Fix reviews table structure

  1. Ensure all required columns exist
  2. Fix any missing columns or constraints
  3. Update RLS policies
*/

-- Ensure reviews table has all required columns
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
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

-- Update existing records to have default values
UPDATE public.reviews 
SET 
    updated_at = created_at,
    is_anonymous = COALESCE(is_anonymous, FALSE),
    check_in_verified = COALESCE(check_in_verified, FALSE)
WHERE updated_at IS NULL OR is_anonymous IS NULL OR check_in_verified IS NULL;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure proper constraints
ALTER TABLE public.reviews 
    ALTER COLUMN wheelchair_access SET DEFAULT 0,
    ALTER COLUMN entrance_access SET DEFAULT 0,
    ALTER COLUMN bathroom_access SET DEFAULT 0,
    ALTER COLUMN table_height SET DEFAULT 0,
    ALTER COLUMN staff_helpfulness SET DEFAULT 0,
    ALTER COLUMN is_anonymous SET DEFAULT FALSE,
    ALTER COLUMN check_in_verified SET DEFAULT FALSE;

-- Add check constraints if they don't exist
DO $$
BEGIN
    -- Check if constraint exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reviews_wheelchair_access_check'
    ) THEN
        ALTER TABLE public.reviews ADD CONSTRAINT reviews_wheelchair_access_check 
            CHECK (wheelchair_access >= 0 AND wheelchair_access <= 5);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reviews_entrance_access_check'
    ) THEN
        ALTER TABLE public.reviews ADD CONSTRAINT reviews_entrance_access_check 
            CHECK (entrance_access >= 0 AND entrance_access <= 5);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reviews_bathroom_access_check'
    ) THEN
        ALTER TABLE public.reviews ADD CONSTRAINT reviews_bathroom_access_check 
            CHECK (bathroom_access >= 0 AND bathroom_access <= 5);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reviews_table_height_check'
    ) THEN
        ALTER TABLE public.reviews ADD CONSTRAINT reviews_table_height_check 
            CHECK (table_height >= 0 AND table_height <= 5);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reviews_staff_helpfulness_check'
    ) THEN
        ALTER TABLE public.reviews ADD CONSTRAINT reviews_staff_helpfulness_check 
            CHECK (staff_helpfulness >= 0 AND staff_helpfulness <= 5);
    END IF;
END $$;

-- Ensure RLS is enabled and policies exist
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are insertable by authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are updatable by owner" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are deletable by owner" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT 
    USING (true);

CREATE POLICY "Reviews are insertable by authenticated users" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Reviews are updatable by owner" 
    ON public.reviews FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Reviews are deletable by owner" 
    ON public.reviews FOR DELETE 
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;