-- AbleCheck: Reviews Enhancement Features
-- Hilfreich-Bewertungen, Verifizierte User & Melde-System

-- 1. Add verified status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_reason TEXT;

-- 2. Create review_votes table for helpful/not helpful ratings
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per review
    UNIQUE(review_id, user_id)
);

-- 3. Create reports table for abuse reporting
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reported_content_type TEXT NOT NULL CHECK (reported_content_type IN ('review', 'profile', 'place')),
    reported_content_id UUID NOT NULL,
    reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- User being reported
    reason TEXT NOT NULL CHECK (reason IN (
        'inappropriate_content',
        'spam',
        'harassment',
        'false_information',
        'hate_speech',
        'other'
    )),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate reports from same user for same content
    UNIQUE(reported_content_type, reported_content_id, reporter_user_id)
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_content ON reports(reported_content_type, reported_content_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for review_votes
CREATE POLICY "Users can view all review votes" ON review_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_votes
    FOR DELETE USING (auth.uid() = user_id);

-- 7. RLS Policies for reports
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_user_id);

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

-- Admins can view all reports (implement admin role check later)
-- CREATE POLICY "Admins can view all reports" ON reports
--     FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- 8. Create updated view for reviews with vote counts
CREATE OR REPLACE VIEW reviews_with_votes AS
SELECT 
    r.*,
    p.username,
    p.full_name,
    p.avatar_url,
    p.is_verified,
    COALESCE(helpful_votes.count, 0) as helpful_count,
    COALESCE(not_helpful_votes.count, 0) as not_helpful_count,
    (COALESCE(helpful_votes.count, 0) - COALESCE(not_helpful_votes.count, 0)) as helpfulness_score
FROM reviews r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN (
    SELECT review_id, COUNT(*) as count
    FROM review_votes 
    WHERE is_helpful = true
    GROUP BY review_id
) helpful_votes ON r.id = helpful_votes.review_id
LEFT JOIN (
    SELECT review_id, COUNT(*) as count
    FROM review_votes 
    WHERE is_helpful = false
    GROUP BY review_id
) not_helpful_votes ON r.id = not_helpful_votes.review_id;

-- 9. Function to get user's vote for a review
CREATE OR REPLACE FUNCTION get_user_vote_for_review(review_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT is_helpful 
        FROM review_votes 
        WHERE review_id = review_uuid AND user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Insert some sample verified users (optional)
-- UPDATE profiles SET is_verified = true, verification_date = NOW(), verification_reason = 'Community moderator'
-- WHERE id IN (SELECT id FROM profiles LIMIT 2);

-- 11. Create function to calculate review helpfulness ranking
CREATE OR REPLACE FUNCTION calculate_review_helpfulness_rank()
RETURNS TABLE(review_id UUID, helpfulness_rank INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as review_id,
        ROW_NUMBER() OVER (
            PARTITION BY r.place_id 
            ORDER BY 
                (COALESCE(helpful_votes.count, 0) - COALESCE(not_helpful_votes.count, 0)) DESC,
                r.created_at DESC
        )::INTEGER as helpfulness_rank
    FROM reviews r
    LEFT JOIN (
        SELECT review_id, COUNT(*) as count
        FROM review_votes 
        WHERE is_helpful = true
        GROUP BY review_id
    ) helpful_votes ON r.id = helpful_votes.review_id
    LEFT JOIN (
        SELECT review_id, COUNT(*) as count
        FROM review_votes 
        WHERE is_helpful = false
        GROUP BY review_id
    ) not_helpful_votes ON r.id = not_helpful_votes.review_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE review_votes IS 'Stores helpful/not helpful votes for reviews';
COMMENT ON TABLE reports IS 'Stores abuse reports for content moderation';
COMMENT ON COLUMN profiles.is_verified IS 'Indicates if user is verified/trusted';
COMMENT ON VIEW reviews_with_votes IS 'Reviews with vote counts and user verification status';