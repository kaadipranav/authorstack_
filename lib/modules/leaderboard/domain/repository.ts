// Phase 4 Part 2: Leaderboard System - Repository Interface

import type {
    Leaderboard,
    LeaderboardSnapshot,
    LeaderboardEntry,
    LeaderboardEntryWithDetails,
    Badge,
    AuthorBadge,
    AuthorBadgeWithDetails,
    PromoCredit,
    PromoTransaction,
    BoostedBook,
    BoostedBookWithDetails,
    LeaderboardQuery,
    RankingOutput,
    BadgeAwardInput,
    PaginatedResponse,
} from "./types";

export interface ILeaderboardRepository {
    // ============================================================================
    // LEADERBOARDS
    // ============================================================================

    /**
     * Get leaderboard by slug
     */
    getLeaderboardBySlug(slug: string): Promise<Leaderboard | null>;

    /**
     * Get all active leaderboards
     */
    getActiveLeaderboards(): Promise<Leaderboard[]>;

    /**
     * Get leaderboards by filters
     */
    queryLeaderboards(query: LeaderboardQuery): Promise<Leaderboard[]>;

    // ============================================================================
    // LEADERBOARD SNAPSHOTS
    // ============================================================================

    /**
     * Create a new leaderboard snapshot
     */
    createSnapshot(
        leaderboardId: string,
        timeWindowStart: Date,
        timeWindowEnd: Date
    ): Promise<LeaderboardSnapshot>;

    /**
     * Get latest snapshot for a leaderboard
     */
    getLatestSnapshot(leaderboardId: string): Promise<LeaderboardSnapshot | null>;

    /**
     * Get snapshot by ID
     */
    getSnapshot(snapshotId: string): Promise<LeaderboardSnapshot | null>;

    // ============================================================================
    // LEADERBOARD ENTRIES
    // ============================================================================

    /**
     * Bulk insert leaderboard entries for a snapshot
     */
    createEntries(
        snapshotId: string,
        entries: RankingOutput[]
    ): Promise<LeaderboardEntry[]>;

    /**
     * Get entries for a snapshot with pagination
     */
    getEntriesBySnapshot(
        snapshotId: string,
        page: number,
        limit: number
    ): Promise<PaginatedResponse<LeaderboardEntryWithDetails>>;

    /**
     * Get author's current ranking in a leaderboard
     */
    getAuthorRanking(
        leaderboardSlug: string,
        authorId: string
    ): Promise<LeaderboardEntryWithDetails | null>;

    // ============================================================================
    // BADGES
    // ============================================================================

    /**
     * Get all active badges
     */
    getActiveBadges(): Promise<Badge[]>;

    /**
     * Get badge by slug
     */
    getBadgeBySlug(slug: string): Promise<Badge | null>;

    /**
     * Award a badge to an author
     */
    awardBadge(input: BadgeAwardInput): Promise<AuthorBadge>;

    /**
     * Get all active badges for an author
     */
    getAuthorBadges(authorId: string): Promise<AuthorBadgeWithDetails[]>;

    /**
     * Expire time-limited badges
     */
    expireOldBadges(): Promise<number>; // Returns count of expired badges

    // ============================================================================
    // PROMO CREDITS
    // ============================================================================

    /**
     * Get credit balance for a user
     */
    getCreditBalance(profileId: string): Promise<PromoCredit | null>;

    /**
     * Add credits to user account
     */
    addCredits(
        profileId: string,
        amount: number,
        source: string,
        description?: string,
        metadata?: Record<string, any>
    ): Promise<PromoTransaction>;

    /**
     * Deduct credits from user account
     * Returns null if insufficient balance
     */
    deductCredits(
        profileId: string,
        amount: number,
        source: string,
        description?: string,
        relatedEntityType?: string,
        relatedEntityId?: string
    ): Promise<PromoTransaction | null>;

    /**
     * Get transaction history for a user
     */
    getTransactionHistory(
        profileId: string,
        page: number,
        limit: number
    ): Promise<PaginatedResponse<PromoTransaction>>;

    // ============================================================================
    // BOOSTED BOOKS
    // ============================================================================

    /**
     * Create a new boost
     */
    createBoost(
        profileId: string,
        bookId: string,
        slotType: "explore" | "community_feed" | "leaderboard_sidebar",
        startTime: Date,
        endTime: Date,
        creditCost: number
    ): Promise<BoostedBook>;

    /**
     * Get active boosts for a slot type
     */
    getActiveBoosts(
        slotType?: "explore" | "community_feed" | "leaderboard_sidebar"
    ): Promise<BoostedBookWithDetails[]>;

    /**
     * Get user's boost history
     */
    getUserBoosts(
        profileId: string,
        page: number,
        limit: number
    ): Promise<PaginatedResponse<BoostedBookWithDetails>>;

    /**
     * Cancel a boost and return refund amount
     */
    cancelBoost(boostId: string, profileId: string): Promise<number>; // Returns refund amount

    /**
     * Update boost status (scheduled -> active -> completed)
     */
    updateBoostStatuses(): Promise<number>; // Returns count of updated boosts

    /**
     * Check if book has active boost in last N hours
     */
    hasRecentBoost(bookId: string, hours: number): Promise<boolean>;

    /**
     * Count user's boosts in last 24 hours
     */
    countRecentBoosts(profileId: string): Promise<number>;
}
