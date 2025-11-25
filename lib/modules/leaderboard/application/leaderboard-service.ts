// Phase 4 Part 2: Leaderboard System - Service Layer

import { leaderboardRepository } from "../infrastructure/supabase-repository";
import { rankingAlgorithm } from "./ranking-algorithm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
    LeaderboardEntryWithDetails,
    Badge,
    AuthorBadgeWithDetails,
    PromoCredit,
    PromoTransaction,
    BoostedBookWithDetails,
    CreateBoostRequest,
    CreateBoostResponse,
    CancelBoostResponse,
    PaginatedResponse,
    RankingInput,
} from "../domain/types";
import {
    CREDIT_SOURCES,
    BOOST_SLOT_PRICING,
    BOOST_RATE_LIMITS,
    FOLLOWER_MILESTONES,
    BADGE_AWARD_CREDITS,
    DAILY_LOGIN_CREDITS,
    STREAK_BONUS_CREDITS,
    STREAK_BONUS_DAYS,
} from "../domain/types";

export class LeaderboardService {
    // ============================================================================
    // LEADERBOARD OPERATIONS
    // ============================================================================

    /**
     * Get current leaderboard rankings
     */
    async getLeaderboard(
        slug: string,
        page: number = 1,
        limit: number = 50
    ): Promise<PaginatedResponse<LeaderboardEntryWithDetails>> {
        const leaderboard = await leaderboardRepository.getLeaderboardBySlug(slug);
        if (!leaderboard) {
            return {
                data: [],
                pagination: { page, limit, total: 0, has_more: false },
            };
        }

        const snapshot = await leaderboardRepository.getLatestSnapshot(
            leaderboard.id
        );
        if (!snapshot) {
            return {
                data: [],
                pagination: { page, limit, total: 0, has_more: false },
            };
        }

        return leaderboardRepository.getEntriesBySnapshot(
            snapshot.id,
            page,
            limit
        );
    }

    /**
     * Get author's current ranking
     */
    async getAuthorRanking(
        leaderboardSlug: string,
        authorId: string
    ): Promise<LeaderboardEntryWithDetails | null> {
        return leaderboardRepository.getAuthorRanking(leaderboardSlug, authorId);
    }

    /**
     * Calculate and save new leaderboard snapshot
     */
    async calculateLeaderboard(leaderboardSlug: string): Promise<void> {
        const startTime = Date.now();

        const leaderboard = await leaderboardRepository.getLeaderboardBySlug(
            leaderboardSlug
        );
        if (!leaderboard) {
            throw new Error(`Leaderboard not found: ${leaderboardSlug}`);
        }

        // Determine time window
        const timeWindow = this.getTimeWindow(leaderboard.time_window);

        // Get all eligible authors
        const supabase = await createSupabaseServerClient();
        const { data: authors } = await supabase
            .from("author_profiles")
            .select("profile_id")
            .eq("visibility", "public")
            .eq("show_stats", true);

        if (!authors || authors.length === 0) {
            console.log("No eligible authors for leaderboard");
            return;
        }

        // Build ranking inputs
        const inputs: RankingInput[] = authors.map((author) => ({
            author_id: author.profile_id,
            time_window: timeWindow,
            weights: {
                sales: leaderboard.sales_weight,
                engagement: leaderboard.engagement_weight,
                community: leaderboard.community_weight,
            },
        }));

        // Calculate rankings
        const rankings = await rankingAlgorithm.calculateRankings(inputs);

        // Filter out zero-score authors (no activity)
        const activeRankings = rankings.filter((r) => r.total_score > 0);

        // Create snapshot
        const snapshot = await leaderboardRepository.createSnapshot(
            leaderboard.id,
            timeWindow.start,
            timeWindow.end
        );

        // Save entries
        await leaderboardRepository.createEntries(snapshot.id, activeRankings);

        // Update snapshot with calculation time
        const calculationTime = Date.now() - startTime;
        console.log(
            `Leaderboard ${leaderboardSlug} calculated in ${calculationTime}ms with ${activeRankings.length} entries`
        );

        // Award badges for this snapshot
        await this.awardLeaderboardBadges(snapshot.id, leaderboard.time_window);
    }

    /**
     * Get time window for leaderboard type
     */
    private getTimeWindow(
        type: "weekly" | "monthly" | "all_time"
    ): { start: Date; end: Date } {
        const end = new Date();
        let start: Date;

        switch (type) {
            case "weekly":
                start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "monthly":
                start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "all_time":
                start = new Date(0); // Unix epoch
                break;
        }

        return { start, end };
    }

    // ============================================================================
    // BADGE OPERATIONS
    // ============================================================================

    /**
     * Get all active badges
     */
    async getActiveBadges(): Promise<Badge[]> {
        return leaderboardRepository.getActiveBadges();
    }

    /**
     * Get author's badges
     */
    async getAuthorBadges(authorId: string): Promise<AuthorBadgeWithDetails[]> {
        return leaderboardRepository.getAuthorBadges(authorId);
    }

    /**
     * Award badges based on leaderboard rankings
     */
    private async awardLeaderboardBadges(
        snapshotId: string,
        timeWindow: "weekly" | "monthly" | "all_time"
    ): Promise<void> {
        const supabase = await createSupabaseServerClient();

        // Get top 10 entries
        const { data: entries } = await supabase
            .from("leaderboard_entries")
            .select("*")
            .eq("snapshot_id", snapshotId)
            .lte("rank", 10)
            .order("rank", { ascending: true });

        if (!entries) return;

        // Award rank-based badges
        for (const entry of entries) {
            if (!entry.author_id) continue;

            // Top 3
            if (entry.rank <= 3 && timeWindow === "weekly") {
                const badge = await leaderboardRepository.getBadgeBySlug(
                    "top-3-weekly"
                );
                if (badge) {
                    await leaderboardRepository.awardBadge({
                        author_id: entry.author_id,
                        badge_id: badge.id,
                        context: {
                            rank: entry.rank,
                            snapshot_id: snapshotId,
                            week: new Date().toISOString(),
                        },
                    });

                    // Award credits
                    await this.addCredits(
                        entry.author_id,
                        BADGE_AWARD_CREDITS,
                        CREDIT_SOURCES.BADGE_AWARD,
                        `Earned ${BADGE_AWARD_CREDITS} credits for Top 3 badge`
                    );
                }
            }

            // #1
            if (entry.rank === 1 && timeWindow === "weekly") {
                const badge = await leaderboardRepository.getBadgeBySlug("number-1");
                if (badge) {
                    await leaderboardRepository.awardBadge({
                        author_id: entry.author_id,
                        badge_id: badge.id,
                        context: {
                            rank: 1,
                            snapshot_id: snapshotId,
                            week: new Date().toISOString(),
                        },
                    });

                    await this.addCredits(
                        entry.author_id,
                        BADGE_AWARD_CREDITS,
                        CREDIT_SOURCES.BADGE_AWARD,
                        `Earned ${BADGE_AWARD_CREDITS} credits for #1 Author badge`
                    );
                }
            }

            // Top 10
            if (entry.rank <= 10 && timeWindow === "weekly") {
                const badge = await leaderboardRepository.getBadgeBySlug(
                    "top-10-weekly"
                );
                if (badge) {
                    await leaderboardRepository.awardBadge({
                        author_id: entry.author_id,
                        badge_id: badge.id,
                        context: {
                            rank: entry.rank,
                            snapshot_id: snapshotId,
                            week: new Date().toISOString(),
                        },
                    });

                    await this.addCredits(
                        entry.author_id,
                        BADGE_AWARD_CREDITS,
                        CREDIT_SOURCES.BADGE_AWARD,
                        `Earned ${BADGE_AWARD_CREDITS} credits for Top 10 badge`
                    );
                }
            }

            // Rising Author (improved by 20+ positions)
            if (
                entry.previous_rank &&
                entry.previous_rank - entry.rank >= 20
            ) {
                const badge = await leaderboardRepository.getBadgeBySlug(
                    "rising-author"
                );
                if (badge) {
                    await leaderboardRepository.awardBadge({
                        author_id: entry.author_id,
                        badge_id: badge.id,
                        context: {
                            previous_rank: entry.previous_rank,
                            new_rank: entry.rank,
                            improvement: entry.previous_rank - entry.rank,
                            snapshot_id: snapshotId,
                        },
                    });

                    await this.addCredits(
                        entry.author_id,
                        BADGE_AWARD_CREDITS,
                        CREDIT_SOURCES.BADGE_AWARD,
                        `Earned ${BADGE_AWARD_CREDITS} credits for Rising Author badge`
                    );
                }
            }
        }
    }

    /**
     * Check and award follower milestone badges
     */
    async checkFollowerMilestones(authorId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data: profile } = await supabase
            .from("author_profiles")
            .select("follower_count")
            .eq("profile_id", authorId)
            .single();

        if (!profile) return;

        const followerCount = profile.follower_count;

        // Check each milestone
        for (const milestone of FOLLOWER_MILESTONES) {
            if (followerCount >= milestone.followers) {
                const badgeSlug = `followers-${milestone.followers === 1000 ? "1k" : milestone.followers}`;
                const badge = await leaderboardRepository.getBadgeBySlug(badgeSlug);

                if (badge) {
                    // Check if already awarded
                    const existingBadges = await leaderboardRepository.getAuthorBadges(
                        authorId
                    );
                    const alreadyAwarded = existingBadges.some(
                        (ab) => ab.badge_id === badge.id
                    );

                    if (!alreadyAwarded) {
                        await leaderboardRepository.awardBadge({
                            author_id: authorId,
                            badge_id: badge.id,
                            context: {
                                follower_count: followerCount,
                                milestone: milestone.followers,
                            },
                        });

                        // Award milestone credits
                        await this.addCredits(
                            authorId,
                            milestone.credits,
                            CREDIT_SOURCES.FOLLOWER_MILESTONE,
                            `Earned ${milestone.credits} credits for reaching ${milestone.followers} followers`
                        );
                    }
                }
            }
        }
    }

    // ============================================================================
    // CREDIT OPERATIONS
    // ============================================================================

    /**
     * Get user's credit balance
     */
    async getCreditBalance(profileId: string): Promise<number> {
        const credits = await leaderboardRepository.getCreditBalance(profileId);
        return credits?.balance || 0;
    }

    /**
     * Add credits to user account
     */
    async addCredits(
        profileId: string,
        amount: number,
        source: string,
        description?: string,
        metadata?: Record<string, any>
    ): Promise<PromoTransaction> {
        return leaderboardRepository.addCredits(
            profileId,
            amount,
            source,
            description,
            metadata
        );
    }

    /**
     * Get transaction history
     */
    async getTransactionHistory(
        profileId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<PromoTransaction>> {
        return leaderboardRepository.getTransactionHistory(profileId, page, limit);
    }

    /**
     * Award daily login credits
     */
    async awardDailyLoginCredits(profileId: string): Promise<number> {
        // Check if already awarded today
        const supabase = await createSupabaseServerClient();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: todayTransaction } = await supabase
            .from("promo_transactions")
            .select("id")
            .eq("profile_id", profileId)
            .eq("source", CREDIT_SOURCES.DAILY_LOGIN)
            .gte("created_at", today.toISOString())
            .limit(1)
            .single();

        if (todayTransaction) {
            return 0; // Already awarded today
        }

        // Check for streak
        const { data: recentLogins } = await supabase
            .from("promo_transactions")
            .select("created_at")
            .eq("profile_id", profileId)
            .eq("source", CREDIT_SOURCES.DAILY_LOGIN)
            .order("created_at", { ascending: false })
            .limit(STREAK_BONUS_DAYS);

        let streakCount = 0;
        if (recentLogins) {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            yesterday.setHours(0, 0, 0, 0);

            for (const login of recentLogins) {
                const loginDate = new Date(login.created_at);
                loginDate.setHours(0, 0, 0, 0);

                const expectedDate = new Date(
                    yesterday.getTime() - streakCount * 24 * 60 * 60 * 1000
                );

                if (loginDate.getTime() === expectedDate.getTime()) {
                    streakCount++;
                } else {
                    break;
                }
            }
        }

        // Award daily credits
        await this.addCredits(
            profileId,
            DAILY_LOGIN_CREDITS,
            CREDIT_SOURCES.DAILY_LOGIN,
            `Daily login reward`
        );

        let totalAwarded = DAILY_LOGIN_CREDITS;

        // Award streak bonus if applicable
        if (streakCount + 1 >= STREAK_BONUS_DAYS) {
            await this.addCredits(
                profileId,
                STREAK_BONUS_CREDITS,
                CREDIT_SOURCES.STREAK_BONUS,
                `${STREAK_BONUS_DAYS}-day login streak bonus!`
            );
            totalAwarded += STREAK_BONUS_CREDITS;
        }

        return totalAwarded;
    }

    // ============================================================================
    // BOOST OPERATIONS
    // ============================================================================

    /**
     * Create a new boost
     */
    async createBoost(
        profileId: string,
        request: CreateBoostRequest
    ): Promise<CreateBoostResponse> {
        // Validate rate limits
        const recentBoostCount = await leaderboardRepository.countRecentBoosts(
            profileId
        );
        if (recentBoostCount >= BOOST_RATE_LIMITS.MAX_BOOSTS_PER_DAY) {
            throw new Error("Daily boost limit reached (10 boosts per 24 hours)");
        }

        // Check if book has recent boost
        const hasRecent = await leaderboardRepository.hasRecentBoost(
            request.book_id,
            BOOST_RATE_LIMITS.MIN_HOURS_BETWEEN_SAME_BOOK
        );
        if (hasRecent) {
            throw new Error(
                "This book was recently boosted. Please wait 24 hours between boosts."
            );
        }

        // Calculate cost
        const slotPricing = BOOST_SLOT_PRICING[request.slot_type];
        const creditCost = Math.ceil(
            (slotPricing.credits_per_24hr * request.duration_hours) / 24
        );

        // Check balance
        const balance = await this.getCreditBalance(profileId);
        if (balance < creditCost) {
            throw new Error(
                `Insufficient credits. Required: ${creditCost}, Available: ${balance}`
            );
        }

        // Deduct credits
        const transaction = await leaderboardRepository.deductCredits(
            profileId,
            creditCost,
            CREDIT_SOURCES.BOOST_SPEND,
            `Boost for ${request.slot_type} (${request.duration_hours}h)`,
            "boost",
            undefined // Will be set after boost is created
        );

        if (!transaction) {
            throw new Error("Failed to deduct credits");
        }

        // Create boost
        const startTime = request.start_time
            ? new Date(request.start_time)
            : new Date();
        const endTime = new Date(
            startTime.getTime() + request.duration_hours * 60 * 60 * 1000
        );

        const boost = await leaderboardRepository.createBoost(
            profileId,
            request.book_id,
            request.slot_type,
            startTime,
            endTime,
            creditCost
        );

        return {
            boost,
            credit_balance: balance - creditCost,
            transaction_id: transaction.id,
        };
    }

    /**
     * Get active boosts for a slot
     */
    async getActiveBoosts(
        slotType?: "explore" | "community_feed" | "leaderboard_sidebar"
    ): Promise<BoostedBookWithDetails[]> {
        return leaderboardRepository.getActiveBoosts(slotType);
    }

    /**
     * Get user's boost history
     */
    async getUserBoosts(
        profileId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<BoostedBookWithDetails>> {
        return leaderboardRepository.getUserBoosts(profileId, page, limit);
    }

    /**
     * Cancel a boost and refund credits
     */
    async cancelBoost(
        boostId: string,
        profileId: string
    ): Promise<CancelBoostResponse> {
        const refundAmount = await leaderboardRepository.cancelBoost(
            boostId,
            profileId
        );

        if (refundAmount > 0) {
            // Add refund credits
            await this.addCredits(
                profileId,
                refundAmount,
                CREDIT_SOURCES.BOOST_REFUND,
                `Refund for cancelled boost`,
                { boost_id: boostId }
            );
        }

        const newBalance = await this.getCreditBalance(profileId);

        return {
            success: true,
            refund_amount: refundAmount,
            credit_balance: newBalance,
        };
    }

    // ============================================================================
    // MAINTENANCE OPERATIONS
    // ============================================================================

    /**
     * Update boost statuses (scheduled -> active -> completed)
     */
    async updateBoostStatuses(): Promise<number> {
        return leaderboardRepository.updateBoostStatuses();
    }

    /**
     * Expire old badges
     */
    async expireOldBadges(): Promise<number> {
        return leaderboardRepository.expireOldBadges();
    }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();
