// Phase 4 Part 1: Community System - Service Layer
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AuthorProfile,
  Post,
  PostWithAuthor,
  PostComment,
  PostCommentWithAuthor,
  Notification,
  NotificationWithActor,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateAuthorProfileRequest,
  FeedQuery,
  PaginatedResponse,
  Follow,
} from "../domain/types";

export class CommunityService {
  // ============================================================================
  // AUTHOR PROFILES
  // ============================================================================

  async getAuthorProfile(profileId: string): Promise<AuthorProfile | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error || !data) return null;
    return data as AuthorProfile;
  }

  async getAuthorProfileBySlug(slug: string): Promise<AuthorProfile | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return data as AuthorProfile;
  }

  async updateAuthorProfile(
    profileId: string,
    updates: UpdateAuthorProfileRequest
  ): Promise<AuthorProfile | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("author_profiles")
      .update(updates)
      .eq("profile_id", profileId)
      .select()
      .single();

    if (error || !data) return null;
    return data as AuthorProfile;
  }

  // ============================================================================
  // POSTS
  // ============================================================================

  async createPost(
    authorId: string,
    request: CreatePostRequest
  ): Promise<Post | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: authorId,
        content: request.content,
        book_id: request.book_id || null,
        post_type: request.post_type || "text",
        metadata: request.metadata || {},
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to create post:", error);
      return null;
    }

    return data as Post;
  }

  async getPost(postId: string, userId?: string): Promise<PostWithAuthor | null> {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("posts")
      .select(`
        *,
        author:profiles!posts_author_id_fkey (
          id,
          full_name
        ),
        author_profile:author_profiles!author_profiles_profile_id_fkey (
          display_name,
          avatar_url,
          slug
        ),
        book:books (
          id,
          title,
          cover_url
        )
      `)
      .eq("id", postId)
      .eq("is_deleted", false)
      .single();

    const { data, error } = await query;

    if (error || !data) return null;

    // Check if user liked the post
    let userHasLiked = false;
    if (userId) {
      const { data: likeData } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      userHasLiked = !!likeData;
    }

    return {
      ...data,
      author: {
        id: data.author.id,
        display_name: data.author_profile?.display_name || data.author.full_name,
        avatar_url: data.author_profile?.avatar_url || null,
        slug: data.author_profile?.slug || null,
      },
      user_has_liked: userHasLiked,
    } as PostWithAuthor;
  }

  async updatePost(
    postId: string,
    authorId: string,
    updates: UpdatePostRequest
  ): Promise<Post | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .eq("author_id", authorId)
      .select()
      .single();

    if (error || !data) return null;
    return data as Post;
  }

  async deletePost(postId: string, authorId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", postId)
      .eq("author_id", authorId);

    return !error;
  }

  async getFeed(
    userId: string | null,
    query: FeedQuery
  ): Promise<PaginatedResponse<PostWithAuthor>> {
    const supabase = await createSupabaseServerClient();

    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Determine feed type - force global if no userId
    const feedType = !userId ? "global" : (query.feed_type || "following");

    let postsQuery;

    if (feedType === "global") {
      // Global feed: all public posts
      postsQuery = supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_author_id_fkey (
            id,
            full_name
          ),
          author_profile:author_profiles!author_profiles_profile_id_fkey (
            display_name,
            avatar_url,
            slug,
            visibility
          ),
          book:books (
            id,
            title,
            cover_url
          )
        `, { count: "exact" })
        .eq("is_deleted", false)
        .eq("author_profile.visibility", "public")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    } else {
      // Following feed: posts from followed authors + own posts (requires userId)
      if (!userId) {
        // Fallback to empty feed if somehow following is requested without userId
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            has_more: false,
          },
        };
      }

      // Get followed user IDs
      const { data: followData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      const followingIds = followData?.map((f) => f.following_id) || [];
      const authorIds = [...followingIds, userId];

      postsQuery = supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_author_id_fkey (
            id,
            full_name
          ),
          author_profile:author_profiles!author_profiles_profile_id_fkey (
            display_name,
            avatar_url,
            slug
          ),
          book:books (
            id,
            title,
            cover_url
          )
        `, { count: "exact" })
        .eq("is_deleted", false)
        .in("author_id", authorIds)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    }

    const { data, error, count } = await postsQuery;

    if (error || !data) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          has_more: false,
        },
      };
    }

    // Get user likes for all posts (only if userId is provided)
    let likedPostIds = new Set<string>();
    if (userId) {
      const postIds = data.map((p) => p.id);
      const { data: likesData } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds);

      likedPostIds = new Set(likesData?.map((l) => l.post_id) || []);
    }

    const posts: PostWithAuthor[] = data.map((post) => ({
      ...post,
      author: {
        id: post.author.id,
        display_name: post.author_profile?.display_name || post.author.full_name,
        avatar_url: post.author_profile?.avatar_url || null,
        slug: post.author_profile?.slug || null,
      },
      user_has_liked: likedPostIds.has(post.id),
    }));

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        has_more: count ? offset + limit < count : false,
      },
    };
  }

  // ============================================================================
  // POST LIKES
  // ============================================================================

  async likePost(postId: string, userId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId });

    return !error;
  }

  async unlikePost(postId: string, userId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    return !error;
  }

  // ============================================================================
  // COMMENTS
  // ============================================================================

  async createComment(
    authorId: string,
    request: CreateCommentRequest
  ): Promise<PostComment | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: request.post_id,
        author_id: authorId,
        content: request.content,
        parent_comment_id: request.parent_comment_id || null,
      })
      .select()
      .single();

    if (error || !data) return null;
    return data as PostComment;
  }

  async getComments(postId: string): Promise<PostCommentWithAuthor[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("post_comments")
      .select(`
        *,
        author:profiles!post_comments_author_id_fkey (
          id,
          full_name
        ),
        author_profile:author_profiles!author_profiles_profile_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((comment) => ({
      ...comment,
      author: {
        id: comment.author.id,
        display_name: comment.author_profile?.display_name || comment.author.full_name,
        avatar_url: comment.author_profile?.avatar_url || null,
      },
    })) as PostCommentWithAuthor[];
  }

  async deleteComment(commentId: string, authorId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("post_comments")
      .update({ is_deleted: true })
      .eq("id", commentId)
      .eq("author_id", authorId);

    return !error;
  }

  // ============================================================================
  // FOLLOWS
  // ============================================================================

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) return false;

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: followerId, following_id: followingId });

    return !error;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    return !error;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    return !!data;
  }

  async getFollowers(userId: string, page = 1, limit = 50): Promise<PaginatedResponse<AuthorProfile>> {
    const supabase = await createSupabaseServerClient();

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("follows")
      .select(`
        follower:author_profiles!author_profiles_profile_id_fkey (*)
      `, { count: "exact" })
      .eq("following_id", userId)
      .range(offset, offset + limit - 1);

    if (error || !data) {
      return {
        data: [],
        pagination: { page, limit, total: 0, has_more: false },
      };
    }

    return {
      data: data.map((f: any) => f.follower) as AuthorProfile[],
      pagination: {
        page,
        limit,
        total: count || 0,
        has_more: count ? offset + limit < count : false,
      },
    };
  }

  async getFollowing(userId: string, page = 1, limit = 50): Promise<PaginatedResponse<AuthorProfile>> {
    const supabase = await createSupabaseServerClient();

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("follows")
      .select(`
        following:author_profiles!author_profiles_profile_id_fkey (*)
      `, { count: "exact" })
      .eq("follower_id", userId)
      .range(offset, offset + limit - 1);

    if (error || !data) {
      return {
        data: [],
        pagination: { page, limit, total: 0, has_more: false },
      };
    }

    return {
      data: data.map((f: any) => f.following) as AuthorProfile[],
      pagination: {
        page,
        limit,
        total: count || 0,
        has_more: count ? offset + limit < count : false,
      },
    };
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async getNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<NotificationWithActor>> {
    const supabase = await createSupabaseServerClient();

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey (
          id,
          full_name
        ),
        actor_profile:author_profiles!author_profiles_profile_id_fkey (
          display_name,
          avatar_url
        )
      `, { count: "exact" })
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) {
      return {
        data: [],
        pagination: { page, limit, total: 0, has_more: false },
      };
    }

    const notifications: NotificationWithActor[] = data.map((notif) => ({
      ...notif,
      actor: notif.actor
        ? {
          id: notif.actor.id,
          display_name: notif.actor_profile?.display_name || notif.actor.full_name,
          avatar_url: notif.actor_profile?.avatar_url || null,
        }
        : null,
    }));

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total: count || 0,
        has_more: count ? offset + limit < count : false,
      },
    };
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("recipient_id", userId);

    return !error;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    return !error;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const supabase = await createSupabaseServerClient();

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    return count || 0;
  }
}

// Export singleton instance
export const communityService = new CommunityService();
