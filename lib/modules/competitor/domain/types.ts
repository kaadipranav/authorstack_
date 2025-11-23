export type CompetitorID = string;

export interface Competitor {
    id: CompetitorID;
    profileId: string;
    asin: string;
    title: string;
    author?: string;
    category?: string;
    format?: 'ebook' | 'paperback' | 'hardcover' | 'audiobook';
    imageUrl?: string;
    amazonUrl?: string;
    lastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CompetitorPrice {
    id: string;
    competitorId: CompetitorID;
    price: number;
    currency: string;
    timestamp: Date;
    createdAt: Date;
}

export interface CompetitorRank {
    id: string;
    competitorId: CompetitorID;
    bsr: number;
    category: string;
    timestamp: Date;
    createdAt: Date;
}

export interface CompetitorReview {
    id: string;
    competitorId: CompetitorID;
    rating: number;
    reviewCount: number;
    timestamp: Date;
    createdAt: Date;
}

export interface CompetitorSummary extends Competitor {
    currentPrice?: number;
    currentBsr?: number;
    currentRating?: number;
    currentReviewCount?: number;
}

export interface AddCompetitorInput {
    asin: string;
    title: string;
    author?: string;
    category?: string;
    format?: 'ebook' | 'paperback' | 'hardcover' | 'audiobook';
    imageUrl?: string;
}

export interface CompetitorPriceHistory {
    competitorId: CompetitorID;
    prices: CompetitorPrice[];
}

export interface CompetitorRankHistory {
    competitorId: CompetitorID;
    ranks: CompetitorRank[];
}
