"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

interface PostComposerProps {
  onPostCreated?: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || content.length > 2000) {
      setError("Post must be between 1 and 2000 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), post_type: "text" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setContent("");
      onPostCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = 2000 - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Card className="p-6 border-2 border-stroke bg-surface">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, milestone, or announcement with the community..."
            className="min-h-[120px] resize-none border-stroke focus:border-burgundy"
            disabled={isSubmitting}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div
              className={`text-sm ${
                isOverLimit
                  ? "text-red-600 font-semibold"
                  : remainingChars < 100
                  ? "text-amber-600"
                  : "text-charcoal"
              }`}
            >
              {remainingChars} characters remaining
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !content.trim() || isOverLimit}
              className="bg-burgundy hover:bg-burgundy/90 text-surface"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
