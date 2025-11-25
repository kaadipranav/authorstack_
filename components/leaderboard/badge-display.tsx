"use client";

import { Trophy } from "lucide-react";
import type { Badge } from "@/lib/modules/leaderboard/domain/types";

interface BadgeDisplayProps {
    badge: Badge;
    awardedAt?: string;
    context?: Record<string, any>;
    size?: "sm" | "md" | "lg";
    showDetails?: boolean;
}

export function BadgeDisplay({
    badge,
    awardedAt,
    context,
    size = "md",
    showDetails = false,
}: BadgeDisplayProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    const tierColors = {
        bronze: "#CD7F32",
        silver: "#C0C0C0",
        gold: "#FFD700",
        platinum: "#E5E4E2",
    };

    const tierGradients = {
        bronze: "from-amber-700 to-amber-900",
        silver: "from-gray-300 to-gray-500",
        gold: "from-yellow-300 to-yellow-600",
        platinum: "from-purple-300 to-purple-600",
    };

    return (
        <div className="group relative inline-block">
            <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-gradient-to-br ${tierGradients[badge.tier]} shadow-lg transition-transform group-hover:scale-110`}
                style={{ backgroundColor: badge.color + "40" }}
            >
                {badge.icon_url ? (
                    <img
                        src={badge.icon_url}
                        alt={badge.name}
                        className={iconSizes[size]}
                    />
                ) : (
                    <Trophy
                        className={iconSizes[size]}
                        style={{ color: tierColors[badge.tier] }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border min-w-[200px]">
                    <div className="font-semibold text-sm">{badge.name}</div>
                    {badge.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                            {badge.description}
                        </div>
                    )}
                    {awardedAt && (
                        <div className="text-xs text-muted-foreground mt-2">
                            Earned: {new Date(awardedAt).toLocaleDateString()}
                        </div>
                    )}
                    {context && context.rank && (
                        <div className="text-xs text-muted-foreground">
                            Rank: #{context.rank}
                        </div>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                </div>
            </div>

            {showDetails && (
                <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{badge.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                        {badge.tier}
                    </div>
                </div>
            )}
        </div>
    );
}

interface BadgeListProps {
    badges: Array<{
        badge: Badge;
        awarded_at: string;
        award_context: Record<string, any>;
    }>;
    maxDisplay?: number;
}

export function BadgeList({ badges, maxDisplay = 6 }: BadgeListProps) {
    const displayBadges = badges.slice(0, maxDisplay);
    const remainingCount = Math.max(0, badges.length - maxDisplay);

    if (badges.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No badges earned yet</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-3 items-center">
            {displayBadges.map((item) => (
                <BadgeDisplay
                    key={item.badge.id}
                    badge={item.badge}
                    awardedAt={item.awarded_at}
                    context={item.award_context}
                    size="md"
                />
            ))}
            {remainingCount > 0 && (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}
