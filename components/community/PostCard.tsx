"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreVertical, Trash2 } from "lucide-react";
import type { PostWithAuthor } from "@/lib/modules/community/domain/types";
import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId: string;
  onLikeToggle?: () => void;
  onDelete?: () => void;
  onCommentClick?: () => void;
}

export function PostCard({
  post,
  currentUserId,
  onLikeToggle,
  onDelete,
  onCommentClick,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwnPost = post.author_id === currentUserId;

  const handleLikeToggle = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/community/posts/${post.id}/like`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      onLikeToggle?.();
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/community/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      onDelete?.();
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  return (
    <Card className="p-6 border-2 border-stroke bg-surface hover:shadow-md transition-all">
      <div className="flex gap-4">
        {/* Author Avatar */}
        <Link
          href={`/dashboard/community/profile/${post.author.slug || post.author_id}` as any}
          className="flex-shrink-0"
        >
          {post.author.avatar_url ? (
            <Image
              src={post.author.avatar_url}
              alt={post.author.display_name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-burgundy">
                {post.author.display_name[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <Link
                href={`/dashboard/community/profile/${post.author.slug || post.author_id}` as any}
                className="font-semibold text-ink hover:text-burgundy transition-colors"
              >
                {post.author.display_name}
              </Link>
              <div className="text-sm text-charcoal">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>

            {isOwnPost && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-surface border-2 border-stroke rounded-lg shadow-lg z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-ink whitespace-pre-wrap mb-4">{post.content}</div>

          {/* Book Attachment */}
          {post.book && (
            <Link
              href={`/dashboard/books/${post.book.id}`}
              className="inline-flex items-center gap-3 p-3 bg-glass border border-stroke rounded-lg hover:border-burgundy/20 transition-colors mb-4"
            >
              {post.book.cover_url && (
                <Image
                  src={post.book.cover_url}
                  alt={post.book.title}
                  width={40}
                  height={60}
                  className="rounded"
                />
              )}
              <div className="text-sm font-medium text-ink">{post.book.title}</div>
            </Link>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={`h-8 gap-2 ${
                isLiked ? "text-burgundy" : "text-charcoal hover:text-burgundy"
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onCommentClick}
              className="h-8 gap-2 text-charcoal hover:text-burgundy"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{post.comment_count}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
