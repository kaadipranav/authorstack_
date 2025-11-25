"use client";

import { useState, useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from "lucide-react";
import type {
    LeaderboardEntryWithDetails,
    PaginatedResponse,
} from "@/lib/modules/leaderboard/domain/types";

interface LeaderboardListProps {
    slug: string;
    initialData?: PaginatedResponse<LeaderboardEntryWithDetails>;
}

export function LeaderboardList({ slug, initialData }: LeaderboardListProps) {
    const [data, setData] = useState<PaginatedResponse<LeaderboardEntryWithDetails>>(
        initialData || { data: [], pagination: { page: 1, limit: 50, total: 0, has_more: false } }
    );
    const [loading, setLoading] = useState(!initialData);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!initialData) {
            fetchLeaderboard();
        }
    }, [slug, page]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/leaderboard/${slug}?page=${page}&limit=50`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Crown className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Crown className="h-5 w-5 text-amber-600" />;
        return null;
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "rising":
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case "falling":
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            case "stable":
                return <Minus className="h-4 w-4 text-gray-400" />;
            default:
                return <span className="text-xs text-blue-500">NEW</span>;
        }
    };

    if (loading && !data.data.length) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data.data.length) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rankings available yet. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.data.map((entry) => (
                <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${entry.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20" : "bg-card"
                        } ${entry.is_boosted ? "ring-2 ring-primary/50" : ""}`}
                >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-16 h-16 shrink-0">
                        {getRankIcon(entry.rank) || (
                            <div className="text-2xl font-bold text-muted-foreground">
                                {entry.rank}
                            </div>
                        )}
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                            src={entry.author?.avatar_url || "/default-avatar.png"}
                            alt={entry.author?.display_name || "Author"}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">
                                    {entry.author?.display_name || "Unknown Author"}
                                </h3>
                                {entry.is_boosted && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                        Sponsored
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>Score: {entry.total_score.toFixed(1)}</span>
                                {entry.previous_rank && (
                                    <div className="flex items-center gap-1">
                                        {getTrendIcon(entry.rank_trend)}
                                        <span className="text-xs">
                                            {entry.rank_trend === "rising" && `+${entry.previous_rank - entry.rank}`}
                                            {entry.rank_trend === "falling" && `-${entry.rank - entry.previous_rank}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    {entry.badges && entry.badges.length > 0 && (
                        <div className="flex gap-1">
                            {entry.badges.slice(0, 3).map((badge) => (
                                <div
                                    key={badge.id}
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: badge.color + "20" }}
                                    title={badge.name}
                                >
                                    {badge.icon_url ? (
                                        <img src={badge.icon_url} alt={badge.name} className="w-5 h-5" />
                                    ) : (
                                        <Trophy className="w-4 h-4" style={{ color: badge.color }} />
                                    )}
                                </div>
                            ))}
                            {entry.badges.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                                    +{entry.badges.length - 3}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Score Breakdown (Tooltip on hover) */}
                    <div className="hidden lg:flex gap-2 text-xs text-muted-foreground">
                        <div className="text-center">
                            <div className="font-medium text-foreground">{entry.sales_score.toFixed(0)}</div>
                            <div>Sales</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-foreground">{entry.engagement_score.toFixed(0)}</div>
                            <div>Engage</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-foreground">{entry.community_score.toFixed(0)}</div>
                            <div>Community</div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {data.pagination.has_more && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
}
