"use client";

import { useState, useEffect } from "react";
import { Clock, X, TrendingUp } from "lucide-react";
import type { BoostedBookWithDetails } from "@/lib/modules/leaderboard/domain/types";

export default function ManageBoostsPage() {
    const [boosts, setBoosts] = useState<BoostedBookWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoosts();
    }, []);

    const fetchBoosts = async () => {
        try {
            const res = await fetch("/api/promo/boosts");
            const data = await res.json();
            setBoosts(data.data || []);
        } catch (err) {
            console.error("Failed to fetch boosts:", err);
        } finally {
            setLoading(false);
        }
    };

    const cancelBoost = async (boostId: string) => {
        if (!confirm("Are you sure you want to cancel this boost? You'll receive a prorated refund.")) {
            return;
        }

        try {
            const res = await fetch(`/api/promo/boosts?boostId=${boostId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchBoosts();
            }
        } catch (err) {
            console.error("Failed to cancel boost:", err);
        }
    };

    const getTimeRemaining = (endTime: string) => {
        const end = new Date(endTime);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return "Ended";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    const activeBoosts = boosts.filter((b) => b.status === "active" || b.status === "scheduled");
    const pastBoosts = boosts.filter((b) => b.status === "completed" || b.status === "cancelled");

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Manage Boosts</h1>

            {/* Active Boosts */}
            <div className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Active Boosts</h2>
                {activeBoosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No active boosts</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeBoosts.map((boost) => (
                            <div
                                key={boost.id}
                                className="border rounded-lg p-4 bg-card flex items-center gap-4"
                            >
                                <img
                                    src={boost.book.cover_url || "/default-book-cover.png"}
                                    alt={boost.book.title}
                                    className="w-16 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{boost.book.title}</h3>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <div>Slot: {boost.slot_type.replace("_", " ")}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4" />
                                            {boost.status === "active"
                                                ? getTimeRemaining(boost.end_time)
                                                : "Scheduled"}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Cost</div>
                                    <div className="font-semibold">{boost.credit_cost} credits</div>
                                    {boost.status === "active" && (
                                        <button
                                            onClick={() => cancelBoost(boost.id)}
                                            className="mt-2 text-sm text-red-500 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4 inline mr-1" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Boosts */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Past Boosts</h2>
                {pastBoosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <p>No past boosts</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pastBoosts.map((boost) => (
                            <div
                                key={boost.id}
                                className="border rounded-lg p-4 bg-card opacity-75 flex items-center gap-4"
                            >
                                <img
                                    src={boost.book.cover_url || "/default-book-cover.png"}
                                    alt={boost.book.title}
                                    className="w-16 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{boost.book.title}</h3>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <div>Slot: {boost.slot_type.replace("_", " ")}</div>
                                        <div className="capitalize">{boost.status}</div>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    <div>{boost.impressions.toLocaleString()} impressions</div>
                                    <div>{boost.clicks.toLocaleString()} clicks</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
