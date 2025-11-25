// Phase 4 Part 2: Leaderboard System - Ranking Algorithm

import type {
    RankingInput,
    RankingOutput,
    ScoreComponent,
    RawMetrics,
} from "../domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Calculate leaderboard rankings for authors within a time window
 */
export class RankingAlgorithm {
    /**
     * Calculate rankings for all eligible authors
     */
    async calculateRankings(
        inputs: RankingInput[]
    ): Promise<RankingOutput[]> {
        const results: RankingOutput[] = [];

        for (const input of inputs) {
            const output = await this.calculateAuthorScore(input);
            results.push(output);
        }

        // Sort by total score descending
        results.sort((a, b) => b.total_score - a.total_score);

        return results;
    }

    /**
     * Calculate score for a single author
     */
    private async calculateAuthorScore(
        input: RankingInput
    ): Promise<RankingOutput> {
        const supabase = await createSupabaseServerClient();

        // Fetch raw metrics
        const salesMetrics = await this.getSalesMetrics(
            supabase,
            input.author_id,
            input.time_window
        );
        const engagementMetrics = await this.getEngagementMetrics(
            supabase,
            input.author_id,
            input.time_window
        );
        const communityMetrics = await this.getCommunityMetrics(
            supabase,
            input.author_id,
            input.time_window
        );

        // Calculate component scores
        const salesScore = this.calculateSalesScore(salesMetrics);
        const engagementScore = this.calculateEngagementScore(engagementMetrics);
        const communityScore = this.calculateCommunityScore(communityMetrics);

        // Calculate weighted total
        const totalScore =
            salesScore.weighted_score +
            engagementScore.weighted_score +
            communityScore.weighted_score;

        return {
            author_id: input.author_id,
            total_score: Math.round(totalScore * 100) / 100,
            sales_score: Math.round(salesScore.weighted_score * 100) / 100,
            engagement_score:
                Math.round(engagementScore.weighted_score * 100) / 100,
            community_score:
                Math.round(communityScore.weighted_score * 100) / 100,
            raw_metrics: {
                ...salesMetrics,
                ...engagementMetrics,
                ...communityMetrics,
            },
        };
    }

    /**
     * Get sales metrics for an author in time window
     */
    private async getSalesMetrics(
        supabase: any,
        authorId: string,
        timeWindow: { start: Date; end: Date }
    ): Promise<RawMetrics> {
        const { data, error } = await supabase
            .from("sales_events")
            .select("quantity, amount")
            .eq("profile_id", authorId)
            .gte("occurred_at", timeWindow.start.toISOString())
            .lte("occurred_at", timeWindow.end.toISOString());

        if (error || !data) {
            return { sales_count: 0, sales_velocity: 0 };
        }

        const totalSales = data.reduce(
            (sum: number, event: any) => sum + event.quantity,
            0
        );
        const daysInWindow =
            (timeWindow.end.getTime() - timeWindow.start.getTime()) /
            (1000 * 60 * 60 * 24);
        const velocity = daysInWindow > 0 ? totalSales / daysInWindow : 0;

        return {
            sales_count: totalSales,
            sales_velocity: velocity,
        };
    }

    /**
     * Get engagement metrics for an author in time window
     */
    private async getEngagementMetrics(
        supabase: any,
        authorId: string,
        timeWindow: { start: Date; end: Date }
    ): Promise<RawMetrics> {
        // Get follower growth
        const { data: followData } = await supabase
            .from("follows")
            .select("id")
            .eq("following_id", authorId)
            .gte("created_at", timeWindow.start.toISOString())
            .lte("created_at", timeWindow.end.toISOString());

        const followerGrowth = followData?.length || 0;

        // Get current follower count
        const { data: profileData } = await supabase
            .from("author_profiles")
            .select("follower_count")
            .eq("profile_id", authorId)
            .single();

        const currentFollowers = profileData?.follower_count || 0;

        // Calculate growth rate
        const previousFollowers = Math.max(0, currentFollowers - followerGrowth);
        const growthRate =
            previousFollowers > 0 ? followerGrowth / previousFollowers : followerGrowth;

        return {
            follower_growth: followerGrowth,
            follower_growth_rate: growthRate,
            current_followers: currentFollowers,
        };
    }

    /**
     * Get community metrics for an author in time window
     */
    private async getCommunityMetrics(
        supabase: any,
        authorId: string,
        timeWindow: { start: Date; end: Date }
    ): Promise<RawMetrics> {
        // Get posts created
        const { data: postsData } = await supabase
            .from("posts")
            .select("id, like_count, comment_count")
            .eq("author_id", authorId)
            .eq("is_deleted", false)
            .gte("created_at", timeWindow.start.toISOString())
            .lte("created_at", timeWindow.end.toISOString());

        const postCount = postsData?.length || 0;
        const totalLikes = postsData?.reduce(
            (sum: number, post: any) => sum + post.like_count,
            0
        ) || 0;
        const totalComments = postsData?.reduce(
            (sum: number, post: any) => sum + post.comment_count,
            0
        ) || 0;

        // Get comments given (participation)
        const { data: commentsData } = await supabase
            .from("post_comments")
            .select("id")
            .eq("author_id", authorId)
            .eq("is_deleted", false)
            .gte("created_at", timeWindow.start.toISOString())
            .lte("created_at", timeWindow.end.toISOString());

        const commentsGiven = commentsData?.length || 0;

        // Calculate engagement rate
        const totalEngagement = totalLikes + totalComments;
        const engagementRate = postCount > 0 ? totalEngagement / postCount : 0;

        return {
            post_count: postCount,
            likes_received: totalLikes,
            comments_received: totalComments,
            comments_given: commentsGiven,
            engagement_rate: engagementRate,
        };
    }

    /**
     * Calculate sales score component (0-100 normalized)
     */
    private calculateSalesScore(metrics: RawMetrics): ScoreComponent {
        const velocity = metrics.sales_velocity || 0;

        // Normalize using logarithmic scale (handles wide range of values)
        // Score = 100 * log(velocity + 1) / log(max_expected_velocity + 1)
        // Assuming max expected velocity is 100 sales/day
        const maxVelocity = 100;
        const normalizedValue =
            velocity > 0
                ? (100 * Math.log(velocity + 1)) / Math.log(maxVelocity + 1)
                : 0;

        const cappedValue = Math.min(100, normalizedValue);
        const weight = 0.4; // 40% weight

        return {
            raw_value: velocity,
            normalized_value: Math.round(cappedValue * 100) / 100,
            weight,
            weighted_score: (cappedValue * weight),
        };
    }

    /**
     * Calculate engagement score component (0-100 normalized)
     */
    private calculateEngagementScore(metrics: RawMetrics): ScoreComponent {
        const growthRate = metrics.follower_growth_rate || 0;
        const currentFollowers = metrics.current_followers || 0;

        // Combine growth rate and absolute follower count
        // Growth rate contributes 70%, absolute count contributes 30%
        const growthScore = Math.min(100, growthRate * 100);
        const followerScore = Math.min(
            100,
            (100 * Math.log(currentFollowers + 1)) / Math.log(10000 + 1)
        );

        const normalizedValue = growthScore * 0.7 + followerScore * 0.3;
        const weight = 0.3; // 30% weight

        return {
            raw_value: growthRate,
            normalized_value: Math.round(normalizedValue * 100) / 100,
            weight,
            weighted_score: (normalizedValue * weight),
        };
    }

    /**
     * Calculate community score component (0-100 normalized)
     */
    private calculateCommunityScore(metrics: RawMetrics): ScoreComponent {
        const postCount = metrics.post_count || 0;
        const engagementRate = metrics.engagement_rate || 0;
        const commentsGiven = metrics.comments_given || 0;

        // Post count contributes 40%, engagement rate 40%, participation 20%
        const postScore = Math.min(100, (postCount / 20) * 100); // 20 posts = 100
        const engagementScore = Math.min(100, engagementRate * 10); // 10 avg engagement = 100
        const participationScore = Math.min(100, (commentsGiven / 50) * 100); // 50 comments = 100

        const normalizedValue =
            postScore * 0.4 + engagementScore * 0.4 + participationScore * 0.2;
        const weight = 0.3; // 30% weight

        return {
            raw_value: postCount,
            normalized_value: Math.round(normalizedValue * 100) / 100,
            weight,
            weighted_score: (normalizedValue * weight),
        };
    }

    /**
     * Apply boost multiplier to ranking score
     */
    applyBoostMultiplier(
        baseScore: number,
        slotType: "explore" | "community_feed" | "leaderboard_sidebar" | null
    ): number {
        if (!slotType) return baseScore;

        const multipliers = {
            explore: 1.5,
            community_feed: 1.3,
            leaderboard_sidebar: 1.2,
        };

        const multiplier = multipliers[slotType] || 1.0;

        // Apply multiplier but cap at 2x to prevent complete dominance
        const boostedScore = Math.min(baseScore * multiplier, baseScore * 2);

        return Math.round(boostedScore * 100) / 100;
    }

    /**
     * Calculate percentile rank for a score in a distribution
     */
    calculatePercentile(score: number, allScores: number[]): number {
        const sortedScores = [...allScores].sort((a, b) => a - b);
        const index = sortedScores.findIndex((s) => s >= score);

        if (index === -1) return 100;

        return Math.round((index / sortedScores.length) * 100);
    }
}

// Export singleton instance
export const rankingAlgorithm = new RankingAlgorithm();
