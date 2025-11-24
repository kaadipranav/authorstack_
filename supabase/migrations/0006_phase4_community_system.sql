-- Phase 4 Part 1: Community System
-- Created: November 24, 2025
-- Tables: author_profiles, posts, post_likes, post_comments, follows, notifications

-- ============================================================================
-- 1. AUTHOR PROFILES (Extended from base profiles table)
-- ============================================================================

CREATE TABLE author_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Public profile data
  display_name TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  website TEXT,
  
  -- Social links
  twitter_handle TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_channel TEXT,
  
  -- Privacy settings
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers_only', 'private')),
  show_stats BOOLEAN DEFAULT true,
  show_books BOOLEAN DEFAULT true,
  
  -- Computed stats (denormalized for performance)
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  total_book_sales INTEGER DEFAULT 0,
  
  -- SEO
  slug TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX author_profiles_profile_id_idx ON author_profiles(profile_id);
CREATE INDEX author_profiles_slug_idx ON author_profiles(slug);
CREATE INDEX author_profiles_visibility_idx ON author_profiles(visibility);
CREATE INDEX author_profiles_created_at_idx ON author_profiles(created_at DESC);

-- Auto-create author profile when profile is created
CREATE OR REPLACE FUNCTION create_author_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO author_profiles (profile_id, display_name, slug)
  VALUES (
    NEW.id,
    NEW.full_name,
    LOWER(REGEXP_REPLACE(NEW.full_name || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8), '[^a-z0-9]+', '-', 'gi'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_author_profile();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_author_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER author_profiles_updated_at
  BEFORE UPDATE ON author_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_author_profile_timestamp();

-- ============================================================================
-- 2. POSTS (Community activity feed)
-- ============================================================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  
  -- Optional book attachment
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  
  -- Post type for future extensibility
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'milestone', 'announcement', 'book_launch')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Engagement metrics (denormalized)
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_deleted BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX posts_author_id_idx ON posts(author_id, created_at DESC);
CREATE INDEX posts_book_id_idx ON posts(book_id) WHERE book_id IS NOT NULL;
CREATE INDEX posts_created_at_idx ON posts(created_at DESC) WHERE is_deleted = false;
CREATE INDEX posts_post_type_idx ON posts(post_type);

-- Update timestamp trigger
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_author_profile_timestamp();

-- Increment post count on author_profiles
CREATE OR REPLACE FUNCTION increment_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT NEW.is_deleted THEN
    UPDATE author_profiles 
    SET post_count = post_count + 1 
    WHERE profile_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_created
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_count();

-- Decrement post count when deleted
CREATE OR REPLACE FUNCTION decrement_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE author_profiles 
    SET post_count = post_count - 1 
    WHERE profile_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_deleted
  AFTER UPDATE ON posts
  FOR EACH ROW
  WHEN (NEW.is_deleted = true AND OLD.is_deleted = false)
  EXECUTE FUNCTION decrement_post_count();

-- ============================================================================
-- 3. POST LIKES (Simple reaction system)
-- ============================================================================

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX post_likes_post_id_idx ON post_likes(post_id);
CREATE INDEX post_likes_user_id_idx ON post_likes(user_id, created_at DESC);

-- Update like count on posts
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_like_changed
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count();

-- ============================================================================
-- 4. POST COMMENTS
-- ============================================================================

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  
  -- Nested comments support (optional, for future)
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  
  -- Moderation
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX post_comments_post_id_idx ON post_comments(post_id, created_at ASC);
CREATE INDEX post_comments_author_id_idx ON post_comments(author_id);
CREATE INDEX post_comments_parent_id_idx ON post_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Update timestamp trigger
CREATE TRIGGER post_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_author_profile_timestamp();

-- Update comment count on posts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND NOT OLD.is_deleted THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_comment_changed
  AFTER INSERT OR UPDATE OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- ============================================================================
-- 5. FOLLOWS (Social graph)
-- ============================================================================

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX follows_follower_id_idx ON follows(follower_id);
CREATE INDEX follows_following_id_idx ON follows(following_id);
CREATE INDEX follows_created_at_idx ON follows(created_at DESC);

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the person being followed
    UPDATE author_profiles SET follower_count = follower_count + 1 WHERE profile_id = NEW.following_id;
    -- Increment following count for the follower
    UPDATE author_profiles SET following_count = following_count + 1 WHERE profile_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE author_profiles SET follower_count = follower_count - 1 WHERE profile_id = OLD.following_id;
    -- Decrement following count
    UPDATE author_profiles SET following_count = following_count - 1 WHERE profile_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_follow_changed
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- ============================================================================
-- 6. NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Actor who triggered the notification
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification type
  type TEXT NOT NULL CHECK (type IN ('new_follower', 'post_like', 'post_comment', 'comment_reply', 'mention')),
  
  -- Reference to related entity
  entity_type TEXT CHECK (entity_type IN ('post', 'comment', 'follow')),
  entity_id UUID,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT,
  
  -- Link to action
  action_url TEXT,
  
  -- State
  is_read BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX notifications_recipient_id_idx ON notifications(recipient_id, created_at DESC);
CREATE INDEX notifications_is_read_idx ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX notifications_type_idx ON notifications(type);

-- Auto-create notifications for follows
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get follower's display name
  SELECT COALESCE(ap.display_name, p.full_name) INTO follower_name
  FROM profiles p
  LEFT JOIN author_profiles ap ON ap.profile_id = p.id
  WHERE p.id = NEW.follower_id;
  
  INSERT INTO notifications (
    recipient_id,
    actor_id,
    type,
    entity_type,
    entity_id,
    title,
    message,
    action_url
  ) VALUES (
    NEW.following_id,
    NEW.follower_id,
    'new_follower',
    'follow',
    NEW.id,
    'New Follower',
    follower_name || ' started following you',
    '/dashboard/community/profile/' || NEW.follower_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

-- Auto-create notifications for post likes
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  liker_name TEXT;
  post_author_id UUID;
BEGIN
  -- Get post author
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker's display name
  SELECT COALESCE(ap.display_name, p.full_name) INTO liker_name
  FROM profiles p
  LEFT JOIN author_profiles ap ON ap.profile_id = p.id
  WHERE p.id = NEW.user_id;
  
  INSERT INTO notifications (
    recipient_id,
    actor_id,
    type,
    entity_type,
    entity_id,
    title,
    message,
    action_url
  ) VALUES (
    post_author_id,
    NEW.user_id,
    'post_like',
    'post',
    NEW.post_id,
    'New Like',
    liker_name || ' liked your post',
    '/dashboard/community/posts/' || NEW.post_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_like
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();

-- Auto-create notifications for comments
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  commenter_name TEXT;
  post_author_id UUID;
BEGIN
  -- Get post author
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user comments on their own post
  IF post_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter's display name
  SELECT COALESCE(ap.display_name, p.full_name) INTO commenter_name
  FROM profiles p
  LEFT JOIN author_profiles ap ON ap.profile_id = p.id
  WHERE p.id = NEW.author_id;
  
  INSERT INTO notifications (
    recipient_id,
    actor_id,
    type,
    entity_type,
    entity_id,
    title,
    message,
    action_url
  ) VALUES (
    post_author_id,
    NEW.author_id,
    'post_comment',
    'comment',
    NEW.id,
    'New Comment',
    commenter_name || ' commented on your post',
    '/dashboard/community/posts/' || NEW.post_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_comment
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE author_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Author Profiles: Read based on visibility
CREATE POLICY author_profiles_select ON author_profiles
  FOR SELECT
  USING (
    visibility = 'public'
    OR profile_id = auth.uid()
    OR (
      visibility = 'followers_only'
      AND EXISTS (
        SELECT 1 FROM follows 
        WHERE following_id = profile_id 
        AND follower_id = auth.uid()
      )
    )
  );

CREATE POLICY author_profiles_insert ON author_profiles
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY author_profiles_update ON author_profiles
  FOR UPDATE
  USING (profile_id = auth.uid());

-- Posts: Read public posts or posts from followed authors
CREATE POLICY posts_select ON posts
  FOR SELECT
  USING (
    NOT is_deleted
    AND (
      -- Public posts
      EXISTS (
        SELECT 1 FROM author_profiles 
        WHERE profile_id = author_id 
        AND visibility = 'public'
      )
      -- Or posts from followed authors
      OR EXISTS (
        SELECT 1 FROM follows 
        WHERE following_id = author_id 
        AND follower_id = auth.uid()
      )
      -- Or own posts
      OR author_id = auth.uid()
    )
  );

CREATE POLICY posts_insert ON posts
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY posts_update ON posts
  FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY posts_delete ON posts
  FOR DELETE
  USING (author_id = auth.uid());

-- Post Likes: Anyone can read, users can like/unlike
CREATE POLICY post_likes_select ON post_likes
  FOR SELECT
  USING (true);

CREATE POLICY post_likes_insert ON post_likes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY post_likes_delete ON post_likes
  FOR DELETE
  USING (user_id = auth.uid());

-- Post Comments: Anyone can read, users can comment
CREATE POLICY post_comments_select ON post_comments
  FOR SELECT
  USING (NOT is_deleted);

CREATE POLICY post_comments_insert ON post_comments
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY post_comments_update ON post_comments
  FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY post_comments_delete ON post_comments
  FOR DELETE
  USING (author_id = auth.uid());

-- Follows: Anyone can read, users can follow/unfollow
CREATE POLICY follows_select ON follows
  FOR SELECT
  USING (true);

CREATE POLICY follows_insert ON follows
  FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY follows_delete ON follows
  FOR DELETE
  USING (follower_id = auth.uid());

-- Notifications: Users can only see their own
CREATE POLICY notifications_select ON notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY notifications_update ON notifications
  FOR UPDATE
  USING (recipient_id = auth.uid());

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Get feed for a user (posts from followed authors + own posts)
CREATE OR REPLACE FUNCTION get_user_feed(
  user_uuid UUID,
  page_size INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  post_content TEXT,
  post_type TEXT,
  post_created_at TIMESTAMPTZ,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  book_id UUID,
  like_count INT,
  comment_count INT,
  user_has_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.post_type,
    p.created_at,
    p.author_id,
    COALESCE(ap.display_name, prof.full_name) as author_name,
    ap.avatar_url,
    p.book_id,
    p.like_count,
    p.comment_count,
    EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = user_uuid) as user_has_liked
  FROM posts p
  INNER JOIN profiles prof ON prof.id = p.author_id
  LEFT JOIN author_profiles ap ON ap.profile_id = p.author_id
  WHERE 
    p.is_deleted = false
    AND (
      p.author_id IN (
        SELECT following_id FROM follows WHERE follower_id = user_uuid
      )
      OR p.author_id = user_uuid
    )
  ORDER BY p.created_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get global feed (all public posts)
CREATE OR REPLACE FUNCTION get_global_feed(
  page_size INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  post_content TEXT,
  post_type TEXT,
  post_created_at TIMESTAMPTZ,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  book_id UUID,
  like_count INT,
  comment_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.post_type,
    p.created_at,
    p.author_id,
    COALESCE(ap.display_name, prof.full_name) as author_name,
    ap.avatar_url,
    p.book_id,
    p.like_count,
    p.comment_count
  FROM posts p
  INNER JOIN profiles prof ON prof.id = p.author_id
  LEFT JOIN author_profiles ap ON ap.profile_id = p.author_id
  WHERE 
    p.is_deleted = false
    AND ap.visibility = 'public'
  ORDER BY p.created_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
