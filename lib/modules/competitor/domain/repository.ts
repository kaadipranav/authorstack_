import { Competitor, CompetitorID, CompetitorSummary, AddCompetitorInput, CompetitorPrice, CompetitorRank, CompetitorReview } from './types';

export interface CompetitorRepository {
    // Competitor CRUD
    getCompetitorsByProfileId(profileId: string): Promise<CompetitorSummary[]>;
    getCompetitorById(id: CompetitorID): Promise<Competitor | null>;
    addCompetitor(profileId: string, input: AddCompetitorInput): Promise<Competitor>;
    updateCompetitor(id: CompetitorID, updates: Partial<Competitor>): Promise<Competitor>;
    deleteCompetitor(id: CompetitorID): Promise<void>;

    // Price tracking
    getPriceHistory(competitorId: CompetitorID, limit?: number): Promise<CompetitorPrice[]>;
    addPricePoint(competitorId: CompetitorID, price: number, currency: string): Promise<CompetitorPrice>;

    // Rank tracking
    getRankHistory(competitorId: CompetitorID, limit?: number): Promise<CompetitorRank[]>;
    addRankPoint(competitorId: CompetitorID, bsr: number, category: string): Promise<CompetitorRank>;

    // Review tracking
    getReviewHistory(competitorId: CompetitorID, limit?: number): Promise<CompetitorReview[]>;
    addReviewPoint(competitorId: CompetitorID, rating: number, reviewCount: number): Promise<CompetitorReview>;

    // Sync tracking
    updateSyncTimestamp(id: CompetitorID): Promise<void>;
}
