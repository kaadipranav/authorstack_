// Phase 4 Part 2: Leaderboard System - Supabase Repository Implementation

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ILeaderboardRepository } from "../domain/repository";
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
} from "../domain/types";

export class SupabaseLeaderboardRepository implements ILeaderboardRepository {
    // ============================================================================
    // LEADERBOARDS
    // ============================================================================

    async getLeaderboardBySlug(slug: string): Promise<Leaderboard | null> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("leaderboards")
            .select("*")
            .eq("slug", slug)
            .eq("is_active", true)
            .single();

        if (error || !data) return null;
        return data as Leaderboard;
    }

    async getActiveLeaderboards(): Promise<Leaderboard[]> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("leaderboards")
            .select("*")
            .eq("is_active", true)
            .order("name", { ascending: true });

        if (error || !data) return [];
        return data as Leaderboard[];
    }

    async queryLeaderboards(query: LeaderboardQuery): Promise<Leaderboard[]> {
        const supabase = await createSupabaseServerClient();

        let queryBuilder = supabase
            .from("leaderboards")
            .select("*")
            .eq("is_active", true);

        if (query.type) {
            queryBuilder = queryBuilder.eq("type", query.type);
        }

        if (query.category) {
            queryBuilder = queryBuilder.eq("category", query.category);
        }

        if (query.time_window) {
            queryBuilder = queryBuilder.eq("time_window", query.time_window);
        }

        const { data, error } = await queryBuilder.order("name", {
            ascending: true,
        });

        if (error || !data) return [];
        return data as Leaderboard[];
    }

    // ============================================================================
    // LEADERBOARD SNAPSHOTS
    // ============================================================================

    async createSnapshot(
        leaderboardId: string,
        timeWindowStart: Date,
        timeWindowEnd: Date
    ): Promise<LeaderboardSnapshot> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("leaderboard_snapshots")
            .insert({
                leaderboard_id: leaderboardId,
                snapshot_date: new Date().toISOString(),
                time_window_start: timeWindowStart.toISOString(),
                time_window_end: timeWindowEnd.toISOString(),
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Failed to create snapshot: ${error?.message}`);
        }

        return data as LeaderboardSnapshot;
    }

    async getLatestSnapshot(
        leaderboardId: string
    ): Promise<LeaderboardSnapshot | null> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("leaderboard_snapshots")
            .select("*")
            .eq("leaderboard_id", leaderboardId)
            .order("snapshot_date", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;
        return data as LeaderboardSnapshot;
    }

    async getSnapshot(snapshotId: string): Promise<LeaderboardSnapshot | null> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("leaderboard_snapshots")
            .select("*")
            .eq("id", snapshotId)
            .single();

        if (error || !data) return null;
        return data as LeaderboardSnapshot;
    }

    // ============================================================================
    // LEADERBOARD ENTRIES
    // ============================================================================

    async createEntries(
        snapshotId: string,
        entries: RankingOutput[]
    ): Promise<LeaderboardEntry[]> {
        const supabase = await createSupabaseServerClient();

        const insertData = entries.map((entry, index) => ({
            snapshot_id: snapshotId,
            author_id: entry.author_id,
            rank: index + 1,
            total_score: entry.total_score,
            sales_score: entry.sales_score,
            engagement_score: entry.engagement_score,
            community_score: entry.community_score,
            raw_metrics: entry.raw_metrics,
        }));

        const { data, error } = await supabase
            .from("leaderboard_entries")
            .insert(insertData)
            .select();

        if (error || !data) {
            throw new Error(`Failed to create entries: ${error?.message}`);
        }

        return data as LeaderboardEntry[];
    }

    async getEntriesBySnapshot(
        snapshotId: string,
        page: number = 1,
        limit: number = 50
    ): Promise<PaginatedResponse<LeaderboardEntryWithDetails>> {
        const supabase = await createSupabaseServerClient();

        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from("leaderboard_entries")
            .select(
                `
        *,
        author:profiles!leaderboard_entries_author_id_fkey (
          id,
          full_name
        ),
        author_profile:author_profiles!author_profiles_profile_id_fkey (
          display_name,
          avatar_url,
          slug
        )
      `,
                { count: "exact" }
            )
            .eq("snapshot_id", snapshotId)
            .order("rank", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error || !data) {
            return {
                data: [],
                pagination: { page, limit, total: 0, has_more: false },
            };
        }

        // Get badges for all authors in this page
        const authorIds = data
            .map((entry: any) => entry.author_id)
            .filter(Boolean);
        const { data: badgesData } = await supabase
            .from("author_badges")
            .select(
                `
        *,
        badge:badges (*)
      `
            )
            .in("author_id", authorIds)
            .eq("is_active", true);

        const badgesByAuthor = new Map<string, Badge[]>();
        badgesData?.forEach((ab: any) => {
            if (!badgesByAuthor.has(ab.author_id)) {
                badgesByAuthor.set(ab.author_id, []);
            }
            badgesByAuthor.get(ab.author_id)!.push(ab.badge);
        });

        const entries: LeaderboardEntryWithDetails[] = data.map((entry: any) => {
            const rankTrend =
                entry.previous_rank === null
                    ? "new"
                    : entry.rank < entry.previous_rank
                        ? "rising"
                        : entry.rank > entry.previous_rank
                            ? "falling"
                            : "stable";

            return {
                ...entry,
                author: entry.author
                    ? {
                        id: entry.author.id,
                        display_name:
                            entry.author_profile?.display_name ||
                            entry.author.full_name ||
                            "Unknown",
                        avatar_url: entry.author_profile?.avatar_url || null,
                        slug: entry.author_profile?.slug || null,
                    }
                    : undefined,
                badges: badgesByAuthor.get(entry.author_id) || [],
                rank_trend: rankTrend,
            };
        });

        return {
            data: entries,
            pagination: {
                page,
                limit,
                total: count || 0,
                has_more: count ? offset + limit < count : false,
            },
        };
    }

    async getAuthorRanking(
        leaderboardSlug: string,
        authorId: string
    ): Promise<LeaderboardEntryWithDetails | null> {
        const supabase = await createSupabaseServerClient();

        // Get leaderboard
        const leaderboard = await this.getLeaderboardBySlug(leaderboardSlug);
        if (!leaderboard) return null;

        // Get latest snapshot
        const snapshot = await this.getLatestSnapshot(leaderboard.id);
        if (!snapshot) return null;

        // Get entry
        const { data, error } = await supabase
            .from("leaderboard_entries")
            .select(
                `
        *,
        author:profiles!leaderboard_entries_author_id_fkey (
          id,
          full_name
        ),
        author_profile:author_profiles!author_profiles_profile_id_fkey (
          display_name,
          avatar_url,
          slug
        )
      `
            )
            .eq("snapshot_id", snapshot.id)
            .eq("author_id", authorId)
            .single();

        if (error || !data) return null;

        // Get badges
        const badges = await this.getAuthorBadges(authorId);

        const rankTrend =
            data.previous_rank === null
                ? "new"
                : data.rank < data.previous_rank
                    ? "rising"
                    : data.rank > data.previous_rank
                        ? "falling"
                        : "stable";

        return {
            ...data,
            author: {
                id: data.author.id,
                display_name:
                    data.author_profile?.display_name ||
                    data.author.full_name ||
                    "Unknown",
                avatar_url: data.author_profile?.avatar_url || null,
                slug: data.author_profile?.slug || null,
            },
            badges: badges.map((ab) => ab.badge),
            rank_trend: rankTrend,
        } as LeaderboardEntryWithDetails;
    }

    // ============================================================================
    // BADGES
    // ============================================================================

    async getActiveBadges(): Promise<Badge[]> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("badges")
            .select("*")
            .eq("is_active", true)
            .order("tier", { ascending: false });

        if (error || !data) return [];
        return data as Badge[];
    }

    async getBadgeBySlug(slug: string): Promise<Badge | null> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("badges")
            .select("*")
            .eq("slug", slug)
            .eq("is_active", true)
            .single();

        if (error || !data) return null;
        return data as Badge;
    }

    async awardBadge(input: BadgeAwardInput): Promise<AuthorBadge> {
        const supabase = await createSupabaseServerClient();

        // Get badge to check if it's time-limited
        const badge = await supabase
            .from("badges")
            .select("*")
            .eq("id", input.badge_id)
            .single();

        const expiresAt = badge.data?.is_time_limited
            ? new Date(
                Date.now() + (badge.data.duration_days || 7) * 24 * 60 * 60 * 1000
            ).toISOString()
            : null;

        const { data, error } = await supabase
            .from("author_badges")
            .insert({
                author_id: input.author_id,
                badge_id: input.badge_id,
                award_context: input.context,
                expires_at: expiresAt,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Failed to award badge: ${error?.message}`);
        }

        return data as AuthorBadge;
    }

    async getAuthorBadges(authorId: string): Promise<AuthorBadgeWithDetails[]> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("author_badges")
            .select(
                `
        *,
        badge:badges (*)
      `
            )
            .eq("author_id", authorId)
            .eq("is_active", true)
            .order("awarded_at", { ascending: false });

        if (error || !data) return [];
        return data as AuthorBadgeWithDetails[];
    }

    async expireOldBadges(): Promise<number> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("author_badges")
            .update({ is_active: false })
            .lt("expires_at", new Date().toISOString())
            .eq("is_active", true)
            .select();

        if (error) return 0;
        return data?.length || 0;
    }

    // ============================================================================
    // PROMO CREDITS
    // ============================================================================

    async getCreditBalance(profileId: string): Promise<PromoCredit | null> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("promo_credits")
            .select("*")
            .eq("profile_id", profileId)
            .single();

        if (error || !data) return null;
        return data as PromoCredit;
    }

    async addCredits(
        profileId: string,
        amount: number,
        source: string,
        description?: string,
        metadata?: Record<string, any>
    ): Promise<PromoTransaction> {
        const supabase = await createSupabaseServerClient();

        // Get current balance
        const creditAccount = await this.getCreditBalance(profileId);
        if (!creditAccount) {
            throw new Error("Credit account not found");
        }

        const newBalance = creditAccount.balance + amount;

        // Update balance
        await supabase
            .from("promo_credits")
            .update({
                balance: newBalance,
                lifetime_earned:
                    source === "purchase"
                        ? creditAccount.lifetime_purchased + amount
                        : creditAccount.lifetime_earned + amount,
                lifetime_purchased:
                    source === "purchase"
                        ? creditAccount.lifetime_purchased + amount
                        : creditAccount.lifetime_purchased,
            })
            .eq("profile_id", profileId);

        // Create transaction
        const { data, error } = await supabase
            .from("promo_transactions")
            .insert({
                profile_id: profileId,
                type: source === "purchase" ? "purchase" : "earn",
                amount,
                source,
                description,
                metadata: metadata || {},
                balance_after: newBalance,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Failed to create transaction: ${error?.message}`);
        }

        return data as PromoTransaction;
    }

    async deductCredits(
        profileId: string,
        amount: number,
        source: string,
        description?: string,
        relatedEntityType?: string,
        relatedEntityId?: string
    ): Promise<PromoTransaction | null> {
        const supabase = await createSupabaseServerClient();

        // Get current balance
        const creditAccount = await this.getCreditBalance(profileId);
        if (!creditAccount || creditAccount.balance < amount) {
            return null; // Insufficient balance
        }

        const newBalance = creditAccount.balance - amount;

        // Update balance
        await supabase
            .from("promo_credits")
            .update({
                balance: newBalance,
                lifetime_spent: creditAccount.lifetime_spent + amount,
            })
            .eq("profile_id", profileId);

        // Create transaction
        const { data, error } = await supabase
            .from("promo_transactions")
            .insert({
                profile_id: profileId,
                type: "spend",
                amount: -amount, // Negative for spend
                source,
                description,
                related_entity_type: relatedEntityType,
                related_entity_id: relatedEntityId,
                balance_after: newBalance,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Failed to create transaction: ${error?.message}`);
        }

        return data as PromoTransaction;
    }

    async getTransactionHistory(
        profileId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<PromoTransaction>> {
        const supabase = await createSupabaseServerClient();

        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from("promo_transactions")
            .select("*", { count: "exact" })
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error || !data) {
            return {
                data: [],
                pagination: { page, limit, total: 0, has_more: false },
            };
        }

        return {
            data: data as PromoTransaction[],
            pagination: {
                page,
                limit,
                total: count || 0,
                has_more: count ? offset + limit < count : false,
            },
        };
    }

    // ============================================================================
    // BOOSTED BOOKS
    // ============================================================================

    async createBoost(
        profileId: string,
        bookId: string,
        slotType: "explore" | "community_feed" | "leaderboard_sidebar",
        startTime: Date,
        endTime: Date,
        creditCost: number
    ): Promise<BoostedBook> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("boosted_books")
            .insert({
                profile_id: profileId,
                book_id: bookId,
                slot_type: slotType,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                credit_cost: creditCost,
                status: startTime <= new Date() ? "active" : "scheduled",
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Failed to create boost: ${error?.message}`);
        }

        return data as BoostedBook;
    }

    async getActiveBoosts(
        slotType?: "explore" | "community_feed" | "leaderboard_sidebar"
    ): Promise<BoostedBookWithDetails[]> {
        const supabase = await createSupabaseServerClient();

        let query = supabase
            .from("boosted_books")
            .select(
                `
        *,
        book:books (
          id,
          title,
          cover_path
        ),
        author:profiles!boosted_books_profile_id_fkey (
          id,
          full_name
        ),
        author_profile:author_profiles!author_profiles_profile_id_fkey (
          display_name,
          avatar_url
        )
      `
            )
            .eq("status", "active")
            .lte("start_time", new Date().toISOString())
            .gte("end_time", new Date().toISOString());

        if (slotType) {
            query = query.eq("slot_type", slotType);
        }

        const { data, error } = await query.order("start_time", {
            ascending: true,
        });

        if (error || !data) return [];

        return data.map((boost: any) => ({
            ...boost,
            book: {
                id: boost.book.id,
                title: boost.book.title,
                cover_url: boost.book.cover_path,
            },
            author: {
                id: boost.author.id,
                display_name:
                    boost.author_profile?.display_name || boost.author.full_name,
                avatar_url: boost.author_profile?.avatar_url || null,
            },
        })) as BoostedBookWithDetails[];
    }

    async getUserBoosts(
        profileId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<BoostedBookWithDetails>> {
        const supabase = await createSupabaseServerClient();

        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from("boosted_books")
            .select(
                `
        *,
        book:books (
          id,
          title,
          cover_path
        ),
        author:profiles!boosted_books_profile_id_fkey (
          id,
          full_name
        ),
        author_profile:author_profiles!author_profiles_profile_id_fkey (
          display_name,
          avatar_url
        )
      `,
                { count: "exact" }
            )
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error || !data) {
            return {
                data: [],
                pagination: { page, limit, total: 0, has_more: false },
            };
        }

        const boosts = data.map((boost: any) => ({
            ...boost,
            book: {
                id: boost.book.id,
                title: boost.book.title,
                cover_url: boost.book.cover_path,
            },
            author: {
                id: boost.author.id,
                display_name:
                    boost.author_profile?.display_name || boost.author.full_name,
                avatar_url: boost.author_profile?.avatar_url || null,
            },
        })) as BoostedBookWithDetails[];

        return {
            data: boosts,
            pagination: {
                page,
                limit,
                total: count || 0,
                has_more: count ? offset + limit < count : false,
            },
        };
    }

    async cancelBoost(boostId: string, profileId: string): Promise<number> {
        const supabase = await createSupabaseServerClient();

        // Get boost
        const { data: boost, error: fetchError } = await supabase
            .from("boosted_books")
            .select("*")
            .eq("id", boostId)
            .eq("profile_id", profileId)
            .single();

        if (fetchError || !boost) {
            throw new Error("Boost not found");
        }

        if (boost.status === "completed" || boost.status === "cancelled") {
            return 0; // Already completed/cancelled
        }

        // Calculate refund (prorated based on time remaining)
        const now = new Date();
        const endTime = new Date(boost.end_time);
        const startTime = new Date(boost.start_time);
        const totalDuration = endTime.getTime() - startTime.getTime();
        const remainingDuration = endTime.getTime() - now.getTime();
        const refundRatio = Math.max(0, remainingDuration / totalDuration);
        const refundAmount = Math.floor(boost.credit_cost * refundRatio);

        // Update boost status
        await supabase
            .from("boosted_books")
            .update({ status: "cancelled" })
            .eq("id", boostId);

        return refundAmount;
    }

    async updateBoostStatuses(): Promise<number> {
        const supabase = await createSupabaseServerClient();

        const now = new Date().toISOString();

        // Mark scheduled as active
        const { data: activated } = await supabase
            .from("boosted_books")
            .update({ status: "active" })
            .eq("status", "scheduled")
            .lte("start_time", now)
            .select();

        // Mark active as completed
        const { data: completed } = await supabase
            .from("boosted_books")
            .update({ status: "completed" })
            .eq("status", "active")
            .lte("end_time", now)
            .select();

        return (activated?.length || 0) + (completed?.length || 0);
    }

    async hasRecentBoost(bookId: string, hours: number): Promise<boolean> {
        const supabase = await createSupabaseServerClient();

        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

        const { data, error } = await supabase
            .from("boosted_books")
            .select("id")
            .eq("book_id", bookId)
            .gte("end_time", cutoffTime.toISOString())
            .limit(1);

        return !error && data && data.length > 0;
    }

    async countRecentBoosts(profileId: string): Promise<number> {
        const supabase = await createSupabaseServerClient();

        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const { count, error } = await supabase
            .from("boosted_books")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profileId)
            .gte("created_at", cutoffTime.toISOString());

        if (error) return 0;
        return count || 0;
    }
}

// Export singleton instance
export const leaderboardRepository = new SupabaseLeaderboardRepository();
