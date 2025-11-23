import { CompetitorRepository } from '../domain/repository';
import { Competitor, CompetitorID, CompetitorSummary, AddCompetitorInput, CompetitorPrice, CompetitorRank, CompetitorReview } from '../domain/types';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export class SupabaseCompetitorRepository implements CompetitorRepository {
    async getCompetitorsByProfileId(profileId: string): Promise<CompetitorSummary[]> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitor_summary_view')
            .select('*')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(this.mapToCompetitorSummary);
    }

    async getCompetitorById(id: CompetitorID): Promise<Competitor | null> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitors')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return this.mapToCompetitor(data);
    }

    async addCompetitor(profileId: string, input: AddCompetitorInput): Promise<Competitor> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitors')
            .insert({
                profile_id: profileId,
                asin: input.asin,
                title: input.title,
                author: input.author,
                category: input.category,
                format: input.format,
                image_url: input.imageUrl,
                amazon_url: `https://www.amazon.com/dp/${input.asin}`,
            })
            .select()
            .single();

        if (error) throw error;

        return this.mapToCompetitor(data);
    }

    async updateCompetitor(id: CompetitorID, updates: Partial<Competitor>): Promise<Competitor> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitors')
            .update({
                title: updates.title,
                author: updates.author,
                category: updates.category,
                format: updates.format,
                image_url: updates.imageUrl,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return this.mapToCompetitor(data);
    }

    async deleteCompetitor(id: CompetitorID): Promise<void> {
        const supabase = await createSupabaseServiceClient();

        const { error } = await supabase
            .from('competitors')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getPriceHistory(competitorId: CompetitorID, limit: number = 30): Promise<CompetitorPrice[]> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitor_prices')
            .select('*')
            .eq('competitor_id', competitorId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map(this.mapToCompetitorPrice);
    }

    async addPricePoint(competitorId: CompetitorID, price: number, currency: string): Promise<CompetitorPrice> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitor_prices')
            .insert({
                competitor_id: competitorId,
                price,
                currency,
            })
            .select()
            .single();

        if (error) throw error;

        return this.mapToCompetitorPrice(data);
    }

    async getRankHistory(competitorId: CompetitorID, limit: number = 30): Promise<CompetitorRank[]> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitor_ranks')
            .select('*')
            .eq('competitor_id', competitorId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map(this.mapToCompetitorRank);
    }

    async addRankPoint(competitorId: CompetitorID, bsr: number, category: string): Promise<CompetitorRank> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitor_ranks')
            .insert({
                competitor_id: competitorId,
                bsr,
                category,
            })
            .select()
            .single();

        if (error) throw error;

        return this.mapToCompetitorRank(data);
    }

    async getReviewHistory(competitorId: CompetitorID, limit: number = 30): Promise<CompetitorReview[]> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitor_reviews')
            .select('*')
            .eq('competitor_id', competitorId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map(this.mapToCompetitorReview);
    }

    async addReviewPoint(competitorId: CompetitorID, rating: number, reviewCount: number): Promise<CompetitorReview> {
        const supabase = await createSupabaseServiceClient();

        const { data, error } = await supabase
            .from('competitor_reviews')
            .insert({
                competitor_id: competitorId,
                rating,
                review_count: reviewCount,
            })
            .select()
            .single();

        if (error) throw error;

        return this.mapToCompetitorReview(data);
    }

    async updateSyncTimestamp(id: CompetitorID): Promise<void> {
        const supabase = await createSupabaseServiceClient();

        const { error } = await supabase
            .from('competitors')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // Mapping functions
    private mapToCompetitor(data: any): Competitor {
        return {
            id: data.id,
            profileId: data.profile_id,
            asin: data.asin,
            title: data.title,
            author: data.author,
            category: data.category,
            format: data.format,
            imageUrl: data.image_url,
            amazonUrl: data.amazon_url,
            lastSyncedAt: data.last_synced_at ? new Date(data.last_synced_at) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapToCompetitorSummary(data: any): CompetitorSummary {
        return {
            ...this.mapToCompetitor(data),
            currentPrice: data.current_price,
            currentBsr: data.current_bsr,
            currentRating: data.current_rating,
            currentReviewCount: data.current_review_count,
        };
    }

    private mapToCompetitorPrice(data: any): CompetitorPrice {
        return {
            id: data.id,
            competitorId: data.competitor_id,
            price: parseFloat(data.price),
            currency: data.currency,
            timestamp: new Date(data.timestamp),
            createdAt: new Date(data.created_at),
        };
    }

    private mapToCompetitorRank(data: any): CompetitorRank {
        return {
            id: data.id,
            competitorId: data.competitor_id,
            bsr: data.bsr,
            category: data.category,
            timestamp: new Date(data.timestamp),
            createdAt: new Date(data.created_at),
        };
    }

    private mapToCompetitorReview(data: any): CompetitorReview {
        return {
            id: data.id,
            competitorId: data.competitor_id,
            rating: parseFloat(data.rating),
            reviewCount: data.review_count,
            timestamp: new Date(data.timestamp),
            createdAt: new Date(data.created_at),
        };
    }
}
