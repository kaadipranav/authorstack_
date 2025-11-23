import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { services } from '@/lib/services';
import { apiResponse } from '@/lib/api/responses';

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await req.json();

        const { competitorId } = body;

        if (!competitorId) {
            return apiResponse.error('Competitor ID is required', 400);
        }

        // Verify ownership
        const competitor = await services.competitor.getCompetitorDetails(competitorId);
        if (!competitor || competitor.profileId !== user.id) {
            return apiResponse.error('Unauthorized', 403);
        }

        await services.competitor.syncCompetitor(competitorId);

        return apiResponse.success({ message: 'Sync triggered successfully' });
    } catch (error: any) {
        console.error('POST /api/competitors/sync error:', error);
        return apiResponse.error(error.message || 'Failed to trigger sync', 500);
    }
}
