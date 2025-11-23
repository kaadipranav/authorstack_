"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIRecommendationsCard } from "@/components/insights/ai-recommendations-card";
import { ObservationInput } from "@/components/insights/observation-input";
import { RevenuePredictionChart } from "@/components/insights/revenue-prediction-chart";
import { MarketingROIChart } from "@/components/insights/marketing-roi-chart";
import { Loader2, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";

interface InsightsDashboard {
    revenuePredictions: any[];
    competitorIntelligence: any[];
    marketingMetrics: any[];
    aiRecommendations: any[];
    observations: any[];
}

export default function InsightsPage() {
    const [dashboard, setDashboard] = useState<InsightsDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await fetch('/api/insights?days=30');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setDashboard(data.data);
        } catch (error) {
            console.error('Failed to fetch insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddObservation = async (text: string) => {
        const response = await fetch('/api/insights/observations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ observationText: text }),
        });

        if (!response.ok) {
            throw new Error('Failed to add observation');
        }

        await fetchDashboard();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-display text-ink">Insights</h1>
                <p className="text-body text-charcoal">
                    AI-powered analytics and recommendations for your publishing business
                </p>
            </div>

            {/* Key metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-stroke bg-surface">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-small text-charcoal flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Predicted Revenue (30d)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-heading-2 font-bold text-ink">
                            ${dashboard?.revenuePredictions.length ?
                                (dashboard.revenuePredictions.reduce((sum, p) => sum + p.predictedRevenue, 0) / 1000).toFixed(1) + 'k'
                                : '0'}
                        </p>
                        <p className="text-mini text-charcoal mt-1">
                            {dashboard?.revenuePredictions[0]?.confidence
                                ? `${(dashboard.revenuePredictions[0].confidence * 100).toFixed(0)}% confidence`
                                : 'No data'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-stroke bg-surface">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-small text-charcoal flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Competitors Tracked
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-heading-2 font-bold text-ink">
                            {dashboard?.competitorIntelligence.length || 0}
                        </p>
                        <p className="text-mini text-charcoal mt-1">Active monitoring</p>
                    </CardContent>
                </Card>

                <Card className="border-stroke bg-surface">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-small text-charcoal flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Marketing ROI
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-heading-2 font-bold text-ink">
                            {dashboard?.marketingMetrics.length
                                ? `${(dashboard.marketingMetrics.reduce((sum, m) => sum + m.roi, 0) / dashboard.marketingMetrics.length).toFixed(1)}x`
                                : '0x'}
                        </p>
                        <p className="text-mini text-charcoal mt-1">Average return</p>
                    </CardContent>
                </Card>

                <Card className="border-stroke bg-surface">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-small text-charcoal flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Active Insights
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-heading-2 font-bold text-ink">
                            {dashboard?.aiRecommendations.length || 0}
                        </p>
                        <p className="text-mini text-charcoal mt-1">Recommendations</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* AI Recommendations */}
                <AIRecommendationsCard recommendations={dashboard?.aiRecommendations || []} />

                {/* Revenue Predictions */}
                <Card className="border-stroke bg-surface">
                    <CardHeader>
                        <CardTitle className="text-heading-2 text-ink">Revenue Forecast</CardTitle>
                        <CardDescription className="text-small text-charcoal">
                            Next 30 days prediction based on historical data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenuePredictionChart predictions={dashboard?.revenuePredictions || []} />
                    </CardContent>
                </Card>

                {/* Marketing Metrics */}
                <Card className="border-stroke bg-surface">
                    <CardHeader>
                        <CardTitle className="text-heading-2 text-ink">Marketing Performance</CardTitle>
                        <CardDescription className="text-small text-charcoal">
                            ROI by channel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MarketingROIChart metrics={dashboard?.marketingMetrics || []} />
                    </CardContent>
                </Card>

                {/* Competitor Intelligence */}
                <Card className="border-stroke bg-surface">
                    <CardHeader>
                        <CardTitle className="text-heading-2 text-ink">Competitor Intelligence</CardTitle>
                        <CardDescription className="text-small text-charcoal">
                            Recent competitor activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dashboard?.competitorIntelligence.length ? (
                            <div className="space-y-2">
                                {dashboard.competitorIntelligence.slice(0, 5).map((intel, index) => (
                                    <div key={index} className="p-3 rounded border border-stroke bg-glass">
                                        <p className="text-body font-semibold text-ink">{intel.competitorTitle}</p>
                                        <p className="text-small text-charcoal">{intel.insight}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-body text-charcoal text-center py-8">
                                Add competitors to see intelligence
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Observations */}
            <ObservationInput
                observations={dashboard?.observations || []}
                onAdd={handleAddObservation}
            />
        </div>
    );
}
