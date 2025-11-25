"use client";

import { useState, useEffect } from "react";
import { Coins, Gift, TrendingUp, Calendar, Zap } from "lucide-react";
import { PromoCard } from "@/components/promo/promo-card";
import { BoostModal } from "@/components/promo/boost-modal";
import type { BoostSlotType } from "@/lib/modules/leaderboard/domain/types";
import { CREDIT_PACKAGES, FOLLOWER_MILESTONES } from "@/lib/modules/leaderboard/domain/types";

export default function PromoMarketplacePage() {
    const [creditBalance, setCreditBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<BoostSlotType>("explore");
    const [dailyLoginClaimed, setDailyLoginClaimed] = useState(false);

    useEffect(() => {
        fetchCreditBalance();
    }, []);

    const fetchCreditBalance = async () => {
        try {
            const res = await fetch("/api/promo/credits");
            const data = await res.json();
            setCreditBalance(data.balance || 0);
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBoostClick = (slotType: BoostSlotType) => {
        setSelectedSlot(slotType);
        setShowBoostModal(true);
    };

    const handleBoostSuccess = () => {
        fetchCreditBalance();
    };

    const claimDailyLogin = async () => {
        try {
            const res = await fetch("/api/promo/credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "daily_login" }),
            });

            const data = await res.json();
            if (data.success && data.credits_awarded > 0) {
                setCreditBalance(data.balance);
                setDailyLoginClaimed(true);
            }
        } catch (err) {
            console.error("Failed to claim daily login:", err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Promo Marketplace</h1>
                </div>
                <p className="text-muted-foreground">
                    Boost your book's visibility and reach more readers
                </p>
            </div>

            {/* Credit Balance Card */}
            <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-muted-foreground mb-1">Your Balance</div>
                        <div className="text-4xl font-bold text-primary">
                            {loading ? "..." : creditBalance.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">credits</div>
                    </div>
                    <Coins className="h-16 w-16 text-primary opacity-20" />
                </div>

                {!dailyLoginClaimed && (
                    <button
                        onClick={claimDailyLogin}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        <Gift className="h-4 w-4 inline mr-2" />
                        Claim Daily Login Bonus (+3 credits)
                    </button>
                )}
            </div>

            {/* Boost Slots */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Boost Slots</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <PromoCard slotType="explore" onBoost={handleBoostClick} />
                    <PromoCard slotType="community_feed" onBoost={handleBoostClick} />
                    <PromoCard slotType="leaderboard_sidebar" onBoost={handleBoostClick} />
                </div>
            </div>

            {/* Earn Free Credits */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Earn Free Credits</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Follower Milestones */}
                    <div className="border rounded-lg p-6 bg-card">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            <h3 className="font-semibold text-lg">Follower Milestones</h3>
                        </div>
                        <div className="space-y-3">
                            {FOLLOWER_MILESTONES.map((milestone) => (
                                <div
                                    key={milestone.followers}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                                >
                                    <span className="text-sm">
                                        {milestone.followers.toLocaleString()} followers
                                    </span>
                                    <span className="font-semibold text-primary">
                                        +{milestone.credits} credits
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Login */}
                    <div className="border rounded-lg p-6 bg-card">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="h-6 w-6 text-primary" />
                            <h3 className="font-semibold text-lg">Daily Login Streak</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <span className="text-sm">Daily login</span>
                                <span className="font-semibold text-primary">+3 credits</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <span className="text-sm">7-day streak bonus</span>
                                <span className="font-semibold text-primary">+10 credits</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <span className="text-sm">Badge earned</span>
                                <span className="font-semibold text-primary">+15 credits</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Credits */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Purchase Credits</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {CREDIT_PACKAGES.map((pkg) => (
                        <div
                            key={pkg.credits}
                            className={`border rounded-lg p-6 bg-card relative ${'badge' in pkg && pkg.badge ? "ring-2 ring-primary" : ""}`}
                        >
                            {'badge' in pkg && pkg.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                    {pkg.badge}
                                </div>
                            )}
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">
                                    {pkg.credits.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground mb-4">credits</div>
                                <div className="text-2xl font-bold text-primary mb-4">
                                    ${pkg.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground mb-4">
                                    {pkg.label}
                                </div>
                                <button
                                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                    onClick={() => alert("Payment integration coming soon!")}
                                >
                                    Purchase
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Boost Modal */}
            <BoostModal
                isOpen={showBoostModal}
                onClose={() => setShowBoostModal(false)}
                slotType={selectedSlot}
                onSuccess={handleBoostSuccess}
            />
        </div>
    );
}
