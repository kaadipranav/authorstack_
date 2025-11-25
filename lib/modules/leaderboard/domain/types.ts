// Phase 4 Part 2: Leaderboard System + Promo Marketplace - Domain Types

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface Leaderboard {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: "author" | "book";
    category: string | null; // NULL = overall, or specific genre
    time_window: "weekly" | "monthly" | "all_time";
    sales_weight: number;
    engagement_weight: number;
    community_weight: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LeaderboardSnapshot {
    id: string;
    leaderboard_id: string;
    snapshot_date: string;
    time_window_start: string;
    time_window_end: string;
    total_entries: number;
    calculation_duration_ms: number | null;
    created_at: string;
}

export interface LeaderboardEntry {
    id: string;
    snapshot_id: string;
    author_id: string | null;
    book_id: string | null;
    rank: number;
    previous_rank: number | null;
    total_score: number;
    sales_score: number;
    engagement_score: number;
    community_score: number;
    raw_metrics: RawMetrics;
    is_boosted: boolean;
    created_at: string;
}

export interface LeaderboardEntryWithDetails extends LeaderboardEntry {
    author?: {
        id: string;
        display_name: string;
        avatar_url: string | null;
        slug: string | null;
    };
    book?: {
        id: string;
        title: string;
        cover_url: string | null;
    };
    badges: Badge[];
    rank_trend: "rising" | "falling" | "stable" | "new";
}

export interface RawMetrics {
    sales_count?: number;
    sales_velocity?: number;
    follower_growth?: number;
    profile_views?: number;
    post_count?: number;
    engagement_rate?: number;
    [key: string]: any;
}

// ============================================================================
// BADGE TYPES
// ============================================================================

export interface Badge {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon_url: string | null;
    color: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
    criteria: BadgeCriteria;
    is_time_limited: boolean;
    duration_days: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BadgeCriteria {
    type:
    | "top_rank"
    | "rank_improvement"
    | "follower_milestone"
    | "growth_leader"
    | "community_leader"
    | "engagement_threshold";
    rank_threshold?: number;
    min_improvement?: number;
    follower_count?: number;
    metric?: string;
    time_window?: "weekly" | "monthly";
    min_rate?: number;
    [key: string]: any;
}

export interface AuthorBadge {
    id: string;
    author_id: string;
    badge_id: string;
    awarded_at: string;
    expires_at: string | null;
    award_context: Record<string, any>;
    is_active: boolean;
    created_at: string;
}

export interface AuthorBadgeWithDetails extends AuthorBadge {
    badge: Badge;
}

// ============================================================================
// PROMO CREDIT TYPES
// ============================================================================

export interface PromoCredit {
    id: string;
    profile_id: string;
    balance: number;
    lifetime_earned: number;
    lifetime_spent: number;
    lifetime_purchased: number;
    created_at: string;
    updated_at: string;
}

export interface PromoTransaction {
    id: string;
    profile_id: string;
    type: "earn" | "purchase" | "spend" | "refund";
    amount: number;
    source: string;
    description: string | null;
    related_entity_type: string | null;
    related_entity_id: string | null;
    metadata: Record<string, any>;
    balance_after: number;
    created_at: string;
}

// Credit earning sources
export const CREDIT_SOURCES = {
    FOLLOWER_MILESTONE: "follower_milestone",
    BADGE_AWARD: "badge_award",
    DAILY_LOGIN: "daily_login",
    STREAK_BONUS: "streak_bonus",
    PURCHASE: "purchase",
    BOOST_SPEND: "boost",
    BOOST_REFUND: "boost_refund",
    ADMIN_GRANT: "admin_grant",
} as const;

// Credit pricing (from user requirements)
export const CREDIT_PACKAGES = [
    { credits: 100, price: 5.0, label: "Starter Pack" },
    { credits: 500, price: 20.0, label: "Popular Pack", badge: "Best Value" },
    { credits: 1200, price: 40.0, label: "Pro Pack" },
] as const;

// Follower milestone rewards
export const FOLLOWER_MILESTONES = [
    { followers: 100, credits: 25 },
    { followers: 500, credits: 50 },
    { followers: 1000, credits: 100 },
] as const;

// Daily login rewards
export const DAILY_LOGIN_CREDITS = 3;
export const STREAK_BONUS_CREDITS = 10;
export const STREAK_BONUS_DAYS = 7;

// Badge award credits
export const BADGE_AWARD_CREDITS = 15;

// ============================================================================
// BOOSTED BOOKS TYPES
// ============================================================================

export interface BoostedBook {
    id: string;
    profile_id: string;
    book_id: string;
    slot_type: "explore" | "community_feed" | "leaderboard_sidebar";
    start_time: string;
    end_time: string;
    credit_cost: number;
    status: "scheduled" | "active" | "completed" | "cancelled";
    impressions: number;
    clicks: number;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface BoostedBookWithDetails extends BoostedBook {
    book: {
        id: string;
        title: string;
        cover_url: string | null;
    };
    author: {
        id: string;
        display_name: string;
        avatar_url: string | null;
    };
}

// Boost slot pricing (from user requirements)
export const BOOST_SLOT_PRICING = {
    explore: { credits_per_24hr: 120, label: "Explore Section", reach: "High" },
    community_feed: {
        credits_per_24hr: 60,
        label: "Community Feed",
        reach: "Medium",
    },
    leaderboard_sidebar: {
        credits_per_24hr: 40,
        label: "Leaderboard Sidebar",
        reach: "Targeted",
    },
} as const;

export type BoostSlotType = keyof typeof BOOST_SLOT_PRICING;

// Boost duration options
export const BOOST_DURATIONS = [
    { hours: 6, label: "6 Hours" },
    { hours: 12, label: "12 Hours" },
    { hours: 24, label: "24 Hours" },
    { hours: 48, label: "48 Hours" },
    { hours: 72, label: "3 Days" },
] as const;

// Boost multipliers for ranking algorithm
export const BOOST_MULTIPLIERS = {
    explore: 1.5,
    community_feed: 1.3,
    leaderboard_sidebar: 1.2,
} as const;

// Rate limits
export const BOOST_RATE_LIMITS = {
    MAX_BOOSTS_PER_DAY: 10,
    MIN_HOURS_BETWEEN_SAME_BOOK: 24,
} as const;

// ============================================================================
// REQUEST/RESPONSE DTOS
// ============================================================================

export interface LeaderboardQuery {
    slug?: string;
    type?: "author" | "book";
    category?: string;
    time_window?: "weekly" | "monthly" | "all_time";
    page?: number;
    limit?: number;
}

export interface CreateBoostRequest {
    book_id: string;
    slot_type: BoostSlotType;
    duration_hours: number;
    start_time?: string; // ISO string, defaults to NOW
}

export interface CreateBoostResponse {
    boost: BoostedBook;
    credit_balance: number;
    transaction_id: string;
}

export interface CancelBoostRequest {
    boost_id: string;
}

export interface CancelBoostResponse {
    success: boolean;
    refund_amount: number;
    credit_balance: number;
}

export interface AddCreditsRequest {
    amount: number;
    source: string;
    description?: string;
    metadata?: Record<string, any>;
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

// ============================================================================
// RANKING ALGORITHM TYPES
// ============================================================================

export interface RankingInput {
    author_id: string;
    time_window: {
        start: Date;
        end: Date;
    };
    weights: {
        sales: number;
        engagement: number;
        community: number;
    };
}

export interface RankingOutput {
    author_id: string;
    total_score: number;
    sales_score: number;
    engagement_score: number;
    community_score: number;
    raw_metrics: RawMetrics;
}

export interface ScoreComponent {
    raw_value: number;
    normalized_value: number; // 0-100
    weight: number;
    weighted_score: number;
}

// ============================================================================
// BADGE AWARD TYPES
// ============================================================================

export interface BadgeAwardInput {
    author_id: string;
    badge_id: string;
    context: Record<string, any>;
}

export interface BadgeCheckResult {
    badge_id: string;
    should_award: boolean;
    context: Record<string, any>;
}
