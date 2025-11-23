"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitorCard } from "@/components/competitors/competitor-card";
import { AddCompetitorModal } from "@/components/competitors/add-competitor-modal";
import { Plus, RefreshCw, Loader2 } from "lucide-react";

interface Competitor {
    id: string;
    asin: string;
    title: string;
    author?: string;
    imageUrl?: string;
    currentPrice?: number;
    currentBsr?: number;
    currentRating?: number;
    currentReviewCount?: number;
}

export default function CompetitorsPage() {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchCompetitors();
    }, []);

    const fetchCompetitors = async () => {
        try {
            const response = await fetch('/api/competitors');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setCompetitors(data.data || []);
        } catch (error) {
            console.error('Failed to fetch competitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompetitor = async (data: { asin: string; title: string; author?: string }) => {
        const response = await fetch('/api/competitors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add competitor');
        }

        await fetchCompetitors();
    };

    const handleViewDetails = (id: string) => {
        // TODO: Open slide-over with competitor details
        console.log('View details for:', id);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            // Trigger sync for all competitors
            await Promise.all(
                competitors.map(comp =>
                    fetch('/api/competitors/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ competitorId: comp.id }),
                    })
                )
            );
            await fetchCompetitors();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    const avgPrice = competitors.length > 0
        ? competitors.reduce((sum, c) => sum + (c.currentPrice || 0), 0) / competitors.filter(c => c.currentPrice).length
        : 0;

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-display text-ink">Competitors</h1>
                        <p className="text-body text-charcoal">
                            Track competitor pricing, rankings, and reviews
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleSync}
                            disabled={syncing || competitors.length === 0}
                            className="border-stroke text-ink hover:bg-glass"
                        >
                            {syncing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Sync All
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="bg-burgundy hover:bg-burgundy/90 text-surface"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Competitor
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 text-sm sm:grid-cols-3">
                <Card className="border-stroke bg-surface">
                    <CardHeader>
                        <CardDescription className="text-charcoal">Total Tracked</CardDescription>
                        <CardTitle className="text-heading-1 text-ink">{competitors.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-stroke bg-surface">
                    <CardHeader>
                        <CardDescription className="text-charcoal">Avg Price</CardDescription>
                        <CardTitle className="text-heading-1 text-ink">
                            ${avgPrice > 0 ? avgPrice.toFixed(2) : '0.00'}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-stroke bg-surface">
                    <CardHeader>
                        <CardDescription className="text-charcoal">Recent Changes</CardDescription>
                        <CardTitle className="text-heading-1 text-ink">
                            {competitors.filter(c => c.currentPrice).length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Competitors grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
                </div>
            ) : competitors.length === 0 ? (
                <Card className="border-stroke bg-surface">
                    <CardHeader>
                        <CardTitle className="text-heading-2 text-ink">No competitors tracked yet</CardTitle>
                        <CardDescription className="text-body text-charcoal">
                            Add your first competitor to start tracking their pricing and performance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="bg-burgundy hover:bg-burgundy/90 text-surface"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Competitor
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {competitors.map((competitor) => (
                        <CompetitorCard
                            key={competitor.id}
                            {...competitor}
                            onViewDetails={handleViewDetails}
                        />
                    ))}
                </div>
            )}

            {/* Add competitor modal */}
            <AddCompetitorModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onAdd={handleAddCompetitor}
            />
        </div>
    );
}
