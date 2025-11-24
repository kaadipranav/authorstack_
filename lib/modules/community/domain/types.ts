// Phase 4 Part 1: Community System - Domain Types

export interface AuthorProfile {
  id: string;
  profile_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  website: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_channel: string | null;
  visibility: "public" | "followers_only" | "private";
  show_stats: boolean;
  show_books: boolean;
  follower_count: number;
  following_count: number;
  post_count: number;
  total_book_sales: number;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  book_id: string | null;
  post_type: "text" | "milestone" | "announcement" | "book_launch";
  metadata: Record<string, any>;
  like_count: number;
  comment_count: number;
  is_deleted: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    slug: string | null;
  };
  user_has_liked?: boolean;
  book?: {
    id: string;
    title: string;
    cover_url: string | null;
  } | null;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostCommentWithAuthor extends PostComment {
  author: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: "new_follower" | "post_like" | "post_comment" | "comment_reply" | "mention";
  entity_type: "post" | "comment" | "follow" | null;
  entity_id: string | null;
  title: string;
  message: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationWithActor extends Notification {
  actor: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

// Request/Response DTOs
export interface CreatePostRequest {
  content: string;
  book_id?: string;
  post_type?: Post["post_type"];
  metadata?: Record<string, any>;
}

export interface UpdatePostRequest {
  content?: string;
  metadata?: Record<string, any>;
}

export interface CreateCommentRequest {
  post_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface UpdateAuthorProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  youtube_channel?: string;
  visibility?: AuthorProfile["visibility"];
  show_stats?: boolean;
  show_books?: boolean;
}

export interface FeedQuery {
  page?: number;
  limit?: number;
  feed_type?: "global" | "following";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}
