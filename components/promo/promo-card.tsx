"use client";

import { Zap, TrendingUp, Users, Sparkles } from "lucide-react";
import type { BoostSlotType } from "@/lib/modules/leaderboard/domain/types";
import { BOOST_SLOT_PRICING } from "@/lib/modules/leaderboard/domain/types";

interface PromoCardProps {
    slotType: BoostSlotType;
    onBoost: (slotType: BoostSlotType) => void;
}

export function PromoCard({ slotType, onBoost }: PromoCardProps) {
    const pricing = BOOST_SLOT_PRICING[slotType];

    const icons = {
        explore: Sparkles,
        community_feed: Users,
        leaderboard_sidebar: TrendingUp,
    };

    const Icon = icons[slotType];

    const descriptions = {
        explore: "Featured prominently in the Explore section. Maximum visibility for your book.",
        community_feed: "Appears in community feeds. Great for engagement and discovery.",
        leaderboard_sidebar: "Shown alongside leaderboard rankings. Targeted visibility.",
    };

    const estimatedReach = {
        explore: "5,000-10,000 impressions/day",
        community_feed: "2,000-5,000 impressions/day",
        leaderboard_sidebar: "1,000-3,000 impressions/day",
    };

    return (
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{pricing.label}</h3>
                        <p className="text-sm text-muted-foreground">{pricing.reach} Reach</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                        {pricing.credits_per_24hr}
                    </div>
                    <div className="text-xs text-muted-foreground">credits/24hr</div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                {descriptions[slotType]}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <TrendingUp className="h-4 w-4" />
                <span>Est. {estimatedReach[slotType]}</span>
            </div>

            <button
                onClick={() => onBoost(slotType)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
                <Zap className="h-4 w-4 inline mr-2" />
                Boost Now
            </button>
        </div>
    );
}
