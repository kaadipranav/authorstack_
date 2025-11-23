export interface InsightObservation {
    id: string;
    profileId: string;
    observationText: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RevenuePrediction {
    date: Date;
    predictedRevenue: number;
    confidence: number; // 0-1
    factors: string[];
}

export interface CompetitorIntelligence {
    competitorId: string;
    competitorTitle: string;
    priceChange: number; // percentage
    rankChange: number;
    insight: string;
}

export interface MarketingMetric {
    channel: string;
    spend: number;
    revenue: number;
    roi: number;
    conversions: number;
}

export interface AIRecommendation {
    type: 'pricing' | 'timing' | 'category' | 'marketing';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
}

export interface InsightsDashboard {
    revenuePredictions: RevenuePrediction[];
    competitorIntelligence: CompetitorIntelligence[];
    marketingMetrics: MarketingMetric[];
    aiRecommendations: AIRecommendation[];
    observations: InsightObservation[];
}

export interface AddObservationInput {
    observationText: string;
    tags?: string[];
}
