"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  profileId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  profileId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousState = isFollowing;

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch("/api/community/follows", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: profileId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle follow");
      }

      onFollowChange?.(!isFollowing);
    } catch (error) {
      // Revert on error
      setIsFollowing(previousState);
      alert("Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      className={
        isFollowing
          ? "border-stroke text-ink hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          : "bg-burgundy hover:bg-burgundy/90 text-surface"
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
