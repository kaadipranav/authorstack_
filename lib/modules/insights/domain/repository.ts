import { InsightObservation, AddObservationInput, InsightsDashboard } from './types';

export interface InsightsRepository {
    // Observations
    getObservationsByProfileId(profileId: string): Promise<InsightObservation[]>;
    addObservation(profileId: string, input: AddObservationInput): Promise<InsightObservation>;
    deleteObservation(id: string): Promise<void>;

    // Dashboard data aggregation
    getDashboardData(profileId: string, dateRange: { start: Date; end: Date }): Promise<InsightsDashboard>;
}
