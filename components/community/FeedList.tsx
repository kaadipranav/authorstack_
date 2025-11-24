"use client";

import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import type { PostWithAuthor } from "@/lib/modules/community/domain/types";

interface FeedListProps {
  currentUserId: string;
  feedType?: "global" | "following";
}

export function FeedList({ currentUserId, feedType = "following" }: FeedListProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = async (pageNum: number, append = false) => {
    try {
      const response = await fetch(
        `/api/community/posts?page=${pageNum}&limit=20&feed_type=${feedType}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const result = await response.json();
      
      if (append) {
        setPosts((prev) => [...prev, ...result.data]);
      } else {
        setPosts(result.data);
      }

      setHasMore(result.pagination.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [feedType]);

  const handleRefresh = () => {
    setIsLoading(true);
    setPage(1);
    fetchPosts(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    fetchPosts(nextPage, true);
  };

  const handlePostCreated = () => {
    handleRefresh();
  };

  const handlePostDeleted = () => {
    handleRefresh();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-charcoal">
          <p className="text-lg mb-2">No posts yet</p>
          <p className="text-sm">
            {feedType === "following"
              ? "Follow some authors to see their posts here"
              : "Be the first to post!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handlePostDeleted}
              onLikeToggle={() => {}}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full sm:w-auto"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
