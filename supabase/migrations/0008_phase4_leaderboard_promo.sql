-- Phase 4 Part 2: Leaderboard System + Promo Marketplace
-- Created: November 25, 2025
-- Tables: leaderboards, leaderboard_snapshots, leaderboard_entries, badges, author_badges,
--         promo_credits, promo_transactions, boosted_books

-- ============================================================================
-- 1. LEADERBOARDS (Configuration and metadata)
-- ============================================================================

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Leaderboard identification
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Type and category
  type TEXT NOT NULL CHECK (type IN ('author', 'book')),
  category TEXT, -- NULL = overall, or specific genre (Fiction, Romance, etc.)
  
  -- Time window
  time_window TEXT NOT NULL CHECK (time_window IN ('weekly', 'monthly', 'all_time')),
  
  -- Ranking criteria weights (must sum to 1.0)
  sales_weight DECIMAL(3,2) DEFAULT 0.40 CHECK (sales_weight >= 0 AND sales_weight <= 1),
  engagement_weight DECIMAL(3,2) DEFAULT 0.30 CHECK (engagement_weight >= 0 AND engagement_weight <= 1),
  community_weight DECIMAL(3,2) DEFAULT 0.30 CHECK (community_weight >= 0 AND community_weight <= 1),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure weights sum to 1.0
  CONSTRAINT weights_sum_check CHECK (sales_weight + engagement_weight + community_weight = 1.0)
);

-- Indexes
CREATE INDEX leaderboards_slug_idx ON leaderboards(slug);
CREATE INDEX leaderboards_type_category_idx ON leaderboards(type, category, time_window);
CREATE INDEX leaderboards_active_idx ON leaderboards(is_active) WHERE is_active = true;

-- ============================================================================
-- 2. LEADERBOARD SNAPSHOTS (Point-in-time rankings)
-- ============================================================================

CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE NOT NULL,
  
  -- Snapshot metadata
  snapshot_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  time_window_start TIMESTAMPTZ NOT NULL,
  time_window_end TIMESTAMPTZ NOT NULL,
  
  -- Calculation metadata
  total_entries INTEGER DEFAULT 0,
  calculation_duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(leaderboard_id, snapshot_date)
);

-- Indexes
CREATE INDEX leaderboard_snapshots_leaderboard_idx ON leaderboard_snapshots(leaderboard_id, snapshot_date DESC);
CREATE INDEX leaderboard_snapshots_date_idx ON leaderboard_snapshots(snapshot_date DESC);

-- ============================================================================
-- 3. LEADERBOARD ENTRIES (Individual rankings)
-- ============================================================================

CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID REFERENCES leaderboard_snapshots(id) ON DELETE CASCADE NOT NULL,
  
  -- Entity being ranked
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  
  -- Ranking
  rank INTEGER NOT NULL,
  previous_rank INTEGER, -- For trend calculation
  
  -- Score breakdown
  total_score DECIMAL(10,2) NOT NULL,
  sales_score DECIMAL(10,2) DEFAULT 0,
  engagement_score DECIMAL(10,2) DEFAULT 0,
  community_score DECIMAL(10,2) DEFAULT 0,
  
  -- Raw metrics (for transparency)
  raw_metrics JSONB DEFAULT '{}',
  
  -- Boost status
  is_boosted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Either author_id or book_id must be set, not both
  CONSTRAINT entry_entity_check CHECK (
    (author_id IS NOT NULL AND book_id IS NULL) OR
    (author_id IS NULL AND book_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX leaderboard_entries_snapshot_rank_idx ON leaderboard_entries(snapshot_id, rank ASC);
CREATE INDEX leaderboard_entries_author_idx ON leaderboard_entries(author_id, created_at DESC) WHERE author_id IS NOT NULL;
CREATE INDEX leaderboard_entries_book_idx ON leaderboard_entries(book_id, created_at DESC) WHERE book_id IS NOT NULL;

-- ============================================================================
-- 4. BADGES (Achievement definitions)
-- ============================================================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Badge identification
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Visual
  icon_url TEXT,
  color TEXT DEFAULT '#FFD700', -- Gold default
  
  -- Tier system
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Award criteria (stored as JSONB for flexibility)
  criteria JSONB NOT NULL DEFAULT '{}',
  -- Example: {"type": "top_rank", "rank_threshold": 10, "time_window": "weekly"}
  -- Example: {"type": "rank_improvement", "min_improvement": 20}
  -- Example: {"type": "follower_milestone", "follower_count": 1000}
  
  -- Badge behavior
  is_time_limited BOOLEAN DEFAULT false, -- If true, badge expires
  duration_days INTEGER, -- How long badge is valid if time_limited
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX badges_slug_idx ON badges(slug);
CREATE INDEX badges_tier_idx ON badges(tier);
CREATE INDEX badges_active_idx ON badges(is_active) WHERE is_active = true;

-- ============================================================================
-- 5. AUTHOR BADGES (Awarded badges)
-- ============================================================================

CREATE TABLE author_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  
  -- Award metadata
  awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ, -- NULL if badge doesn't expire
  
  -- Context of award (e.g., "Top 10 in Week 42 2025")
  award_context JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(author_id, badge_id, awarded_at)
);

-- Indexes
CREATE INDEX author_badges_author_idx ON author_badges(author_id, awarded_at DESC);
CREATE INDEX author_badges_badge_idx ON author_badges(badge_id);
CREATE INDEX author_badges_active_idx ON author_badges(author_id, is_active) WHERE is_active = true;
CREATE INDEX author_badges_expires_idx ON author_badges(expires_at) WHERE expires_at IS NOT NULL;

-- Function to auto-expire badges
CREATE OR REPLACE FUNCTION expire_author_badges()
RETURNS void AS $$
BEGIN
  UPDATE author_badges
  SET is_active = false
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. PROMO CREDITS (User credit balances)
-- ============================================================================

CREATE TABLE promo_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Current balance
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  
  -- Lifetime stats
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX promo_credits_profile_idx ON promo_credits(profile_id);

-- Auto-create credit account when profile is created
CREATE OR REPLACE FUNCTION create_promo_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO promo_credits (profile_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_credits
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_promo_credits();

-- Update timestamp trigger
CREATE TRIGGER promo_credits_updated_at
  BEFORE UPDATE ON promo_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_author_profile_timestamp();

-- ============================================================================
-- 7. PROMO TRANSACTIONS (Credit transaction history)
-- ============================================================================

CREATE TABLE promo_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction type
  type TEXT NOT NULL CHECK (type IN ('earn', 'purchase', 'spend', 'refund')),
  
  -- Amount (positive for earn/purchase/refund, negative for spend)
  amount INTEGER NOT NULL,
  
  -- Source/reason
  source TEXT NOT NULL, -- 'follower_milestone', 'badge_award', 'purchase', 'boost', 'daily_login', etc.
  description TEXT,
  
  -- Related entities
  related_entity_type TEXT, -- 'boost', 'badge', 'purchase', etc.
  related_entity_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Balance after transaction (for audit)
  balance_after INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX promo_transactions_profile_idx ON promo_transactions(profile_id, created_at DESC);
CREATE INDEX promo_transactions_type_idx ON promo_transactions(type);
CREATE INDEX promo_transactions_source_idx ON promo_transactions(source);

-- ============================================================================
-- 8. BOOSTED BOOKS (Active promotional boosts)
-- ============================================================================

CREATE TABLE boosted_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  
  -- Boost configuration
  slot_type TEXT NOT NULL CHECK (slot_type IN ('explore', 'community_feed', 'leaderboard_sidebar')),
  
  -- Time window
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Pricing
  credit_cost INTEGER NOT NULL CHECK (credit_cost > 0),
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  
  -- Performance metrics (optional, for future analytics)
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT time_window_check CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX boosted_books_profile_idx ON boosted_books(profile_id, created_at DESC);
CREATE INDEX boosted_books_book_idx ON boosted_books(book_id, end_time DESC);
CREATE INDEX boosted_books_slot_status_idx ON boosted_books(slot_type, status, end_time DESC);
CREATE INDEX boosted_books_active_idx ON boosted_books(slot_type, start_time, end_time) 
  WHERE status = 'active';

-- Update timestamp trigger
CREATE TRIGGER boosted_books_updated_at
  BEFORE UPDATE ON boosted_books
  FOR EACH ROW
  EXECUTE FUNCTION update_author_profile_timestamp();

-- Function to auto-update boost status
CREATE OR REPLACE FUNCTION update_boost_status()
RETURNS void AS $$
BEGIN
  -- Mark scheduled boosts as active when start_time is reached
  UPDATE boosted_books
  SET status = 'active'
  WHERE status = 'scheduled'
    AND start_time <= NOW();
  
  -- Mark active boosts as completed when end_time is reached
  UPDATE boosted_books
  SET status = 'completed'
  WHERE status = 'active'
    AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosted_books ENABLE ROW LEVEL SECURITY;

-- Leaderboards: Public read, admin-only write
CREATE POLICY leaderboards_select ON leaderboards
  FOR SELECT
  USING (is_active = true);

-- Leaderboard Snapshots: Public read
CREATE POLICY leaderboard_snapshots_select ON leaderboard_snapshots
  FOR SELECT
  USING (true);

-- Leaderboard Entries: Public read
CREATE POLICY leaderboard_entries_select ON leaderboard_entries
  FOR SELECT
  USING (true);

-- Badges: Public read
CREATE POLICY badges_select ON badges
  FOR SELECT
  USING (is_active = true);

-- Author Badges: Public read for active badges
CREATE POLICY author_badges_select ON author_badges
  FOR SELECT
  USING (is_active = true);

-- Promo Credits: Users can only see their own balance
CREATE POLICY promo_credits_select ON promo_credits
  FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY promo_credits_update ON promo_credits
  FOR UPDATE
  USING (profile_id = auth.uid());

-- Promo Transactions: Users can only see their own transactions
CREATE POLICY promo_transactions_select ON promo_transactions
  FOR SELECT
  USING (profile_id = auth.uid());

-- Boosted Books: Public read, owner can manage
CREATE POLICY boosted_books_select ON boosted_books
  FOR SELECT
  USING (true);

CREATE POLICY boosted_books_insert ON boosted_books
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY boosted_books_update ON boosted_books
  FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY boosted_books_delete ON boosted_books
  FOR DELETE
  USING (profile_id = auth.uid());

-- ============================================================================
-- 10. SEED DATA - Default Leaderboards and Badges
-- ============================================================================

-- Insert default leaderboards
INSERT INTO leaderboards (name, slug, type, category, time_window, sales_weight, engagement_weight, community_weight) VALUES
  -- Overall leaderboards
  ('Weekly Top Authors', 'weekly-authors-overall', 'author', NULL, 'weekly', 0.40, 0.30, 0.30),
  ('Monthly Top Authors', 'monthly-authors-overall', 'author', NULL, 'monthly', 0.40, 0.30, 0.30),
  ('All-Time Top Authors', 'alltime-authors-overall', 'author', NULL, 'all_time', 0.40, 0.30, 0.30),
  
  -- Category-specific leaderboards (weekly only for MVP)
  ('Weekly Fiction Authors', 'weekly-authors-fiction', 'author', 'Fiction', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Non-Fiction Authors', 'weekly-authors-nonfiction', 'author', 'Non-Fiction', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Romance Authors', 'weekly-authors-romance', 'author', 'Romance', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Thriller Authors', 'weekly-authors-thriller', 'author', 'Thriller', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Fantasy Authors', 'weekly-authors-fantasy', 'author', 'Fantasy', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Self-Help Authors', 'weekly-authors-selfhelp', 'author', 'Self-Help', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Business Authors', 'weekly-authors-business', 'author', 'Business', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Young Adult Authors', 'weekly-authors-ya', 'author', 'Young Adult', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Sci-Fi Authors', 'weekly-authors-scifi', 'author', 'Sci-Fi', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Mystery Authors', 'weekly-authors-mystery', 'author', 'Mystery', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Poetry Authors', 'weekly-authors-poetry', 'author', 'Poetry', 'weekly', 0.40, 0.30, 0.30),
  ('Weekly Children''s Book Authors', 'weekly-authors-childrens', 'author', 'Children''s Books', 'weekly', 0.40, 0.30, 0.30);

-- Insert default badges
INSERT INTO badges (name, slug, description, tier, icon_url, criteria, is_time_limited, duration_days) VALUES
  -- Ranking badges (time-limited)
  ('Top 10 This Week', 'top-10-weekly', 'Ranked in the top 10 authors this week', 'gold', '/badges/top-10.svg', 
   '{"type": "top_rank", "rank_threshold": 10, "time_window": "weekly"}', true, 7),
  
  ('Top 3 This Week', 'top-3-weekly', 'Ranked in the top 3 authors this week', 'platinum', '/badges/top-3.svg',
   '{"type": "top_rank", "rank_threshold": 3, "time_window": "weekly"}', true, 7),
  
  ('#1 Author', 'number-1', 'Achieved #1 ranking', 'platinum', '/badges/number-1.svg',
   '{"type": "top_rank", "rank_threshold": 1, "time_window": "weekly"}', true, 7),
  
  -- Growth badges (permanent)
  ('Rising Author', 'rising-author', 'Improved ranking by 20+ positions', 'silver', '/badges/rising.svg',
   '{"type": "rank_improvement", "min_improvement": 20}', false, NULL),
  
  ('Fastest Growing', 'fastest-growing', 'Highest follower growth rate this week', 'gold', '/badges/fastest-growing.svg',
   '{"type": "growth_leader", "metric": "followers", "time_window": "weekly"}', true, 7),
  
  -- Milestone badges (permanent)
  ('100 Followers', 'followers-100', 'Reached 100 followers', 'bronze', '/badges/followers-100.svg',
   '{"type": "follower_milestone", "follower_count": 100}', false, NULL),
  
  ('500 Followers', 'followers-500', 'Reached 500 followers', 'silver', '/badges/followers-500.svg',
   '{"type": "follower_milestone", "follower_count": 500}', false, NULL),
  
  ('1K Followers', 'followers-1k', 'Reached 1,000 followers', 'gold', '/badges/followers-1k.svg',
   '{"type": "follower_milestone", "follower_count": 1000}', false, NULL),
  
  -- Community badges (permanent)
  ('Community Champion', 'community-champion', 'Top community contributor this month', 'gold', '/badges/community-champion.svg',
   '{"type": "community_leader", "time_window": "monthly"}', true, 30),
  
  ('Engagement Master', 'engagement-master', 'Exceptional engagement rate', 'silver', '/badges/engagement-master.svg',
   '{"type": "engagement_threshold", "min_rate": 0.15}', false, NULL);

-- ============================================================================
-- 11. HELPER FUNCTIONS
-- ============================================================================

-- Function to get current leaderboard for a specific configuration
CREATE OR REPLACE FUNCTION get_current_leaderboard(
  leaderboard_slug TEXT,
  page_limit INT DEFAULT 50,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  rank INT,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  author_slug TEXT,
  total_score DECIMAL,
  sales_score DECIMAL,
  engagement_score DECIMAL,
  community_score DECIMAL,
  previous_rank INT,
  is_boosted BOOLEAN,
  badge_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    le.rank,
    le.author_id,
    COALESCE(ap.display_name, p.full_name) as author_name,
    ap.avatar_url as author_avatar,
    ap.slug as author_slug,
    le.total_score,
    le.sales_score,
    le.engagement_score,
    le.community_score,
    le.previous_rank,
    le.is_boosted,
    COUNT(ab.id) as badge_count
  FROM leaderboard_entries le
  INNER JOIN leaderboard_snapshots ls ON ls.id = le.snapshot_id
  INNER JOIN leaderboards l ON l.id = ls.leaderboard_id
  LEFT JOIN profiles p ON p.id = le.author_id
  LEFT JOIN author_profiles ap ON ap.profile_id = le.author_id
  LEFT JOIN author_badges ab ON ab.author_id = le.author_id AND ab.is_active = true
  WHERE l.slug = leaderboard_slug
    AND ls.snapshot_date = (
      SELECT MAX(snapshot_date) 
      FROM leaderboard_snapshots 
      WHERE leaderboard_id = l.id
    )
  GROUP BY le.rank, le.author_id, p.full_name, ap.display_name, ap.avatar_url, ap.slug,
           le.total_score, le.sales_score, le.engagement_score, le.community_score,
           le.previous_rank, le.is_boosted
  ORDER BY le.rank ASC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active boosts for a slot type
CREATE OR REPLACE FUNCTION get_active_boosts(
  slot_type_param TEXT
)
RETURNS TABLE (
  boost_id UUID,
  book_id UUID,
  book_title TEXT,
  book_cover_url TEXT,
  author_id UUID,
  author_name TEXT,
  end_time TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bb.id as boost_id,
    b.id as book_id,
    b.title as book_title,
    b.cover_path as book_cover_url,
    p.id as author_id,
    COALESCE(ap.display_name, p.full_name) as author_name,
    bb.end_time
  FROM boosted_books bb
  INNER JOIN books b ON b.id = bb.book_id
  INNER JOIN profiles p ON p.id = bb.profile_id
  LEFT JOIN author_profiles ap ON ap.profile_id = p.id
  WHERE bb.slot_type = slot_type_param
    AND bb.status = 'active'
    AND NOW() BETWEEN bb.start_time AND bb.end_time
  ORDER BY bb.start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
