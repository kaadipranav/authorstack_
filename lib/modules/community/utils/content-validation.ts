// Community-specific rate limiting and content sanitization utilities

import { incrementRateLimit } from "@/lib/cache/redis";

// Rate limit configurations
const RATE_LIMITS = {
  post_creation: { limit: 10, window: 3600 }, // 10 posts per hour
  comment_creation: { limit: 30, window: 3600 }, // 30 comments per hour
  like_action: { limit: 100, window: 3600 }, // 100 likes per hour
  follow_action: { limit: 50, window: 3600 }, // 50 follows per hour
};

export async function checkRateLimit(
  userId: string,
  action: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_LIMITS[action];
  const key = `community:ratelimit:${action}:${userId}`;

  try {
    const count = await incrementRateLimit(userId, config.limit, config.window);

    return {
      allowed: count <= config.limit,
      remaining: Math.max(0, config.limit - count),
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow the request if rate limiting service is down
    return { allowed: true, remaining: config.limit };
  }
}

// Content sanitization
export function sanitizeContent(content: string): string {
  // Remove excessive whitespace
  let sanitized = content.trim().replace(/\s+/g, " ");

  // Remove potentially harmful HTML/script tags (basic XSS prevention)
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*>/gi, "");

  return sanitized;
}

// Content validation
export function validatePostContent(content: string): {
  valid: boolean;
  error?: string;
} {
  const sanitized = sanitizeContent(content);

  if (sanitized.length === 0) {
    return { valid: false, error: "Post content cannot be empty" };
  }

  if (sanitized.length > 2000) {
    return { valid: false, error: "Post content exceeds 2000 characters" };
  }

  // Check for spam patterns
  if (hasSpamPatterns(sanitized)) {
    return { valid: false, error: "Content contains spam patterns" };
  }

  return { valid: true };
}

export function validateCommentContent(content: string): {
  valid: boolean;
  error?: string;
} {
  const sanitized = sanitizeContent(content);

  if (sanitized.length === 0) {
    return { valid: false, error: "Comment content cannot be empty" };
  }

  if (sanitized.length > 1000) {
    return { valid: false, error: "Comment content exceeds 1000 characters" };
  }

  if (hasSpamPatterns(sanitized)) {
    return { valid: false, error: "Content contains spam patterns" };
  }

  return { valid: true };
}

// Basic spam detection
function hasSpamPatterns(content: string): boolean {
  const lowerContent = content.toLowerCase();

  // Check for excessive URLs
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = content.match(urlPattern) || [];
  if (urls.length > 3) return true;

  // Check for repeated characters
  if (/(.)\1{10,}/.test(content)) return true;

  // Check for common spam phrases
  const spamPhrases = [
    "click here",
    "buy now",
    "limited time",
    "act now",
    "100% free",
    "make money fast",
    "work from home",
    "click this link",
  ];

  for (const phrase of spamPhrases) {
    if (lowerContent.includes(phrase)) return true;
  }

  return false;
}

// Profanity filter (basic implementation)
export function hasProfanity(content: string): boolean {
  const profanityList: string[] = [
    // Add commonly filtered words here
    // For production, use a comprehensive library like 'bad-words'
  ];

  const lowerContent = content.toLowerCase();
  return profanityList.some((word) => lowerContent.includes(word));
}

// Content moderation flags
export function shouldFlagContent(content: string): {
  shouldFlag: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (hasSpamPatterns(content)) {
    reasons.push("spam_detected");
  }

  if (hasProfanity(content)) {
    reasons.push("profanity_detected");
  }

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 20) {
    reasons.push("excessive_caps");
  }

  return {
    shouldFlag: reasons.length > 0,
    reasons,
  };
}
