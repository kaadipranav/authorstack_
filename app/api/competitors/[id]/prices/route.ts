import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { services } from '@/lib/services';
import { apiResponse } from '@/lib/api/responses';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Verify ownership
        const competitor = await services.competitor.getCompetitorDetails(params.id);
        if (!competitor || competitor.profileId !== user.id) {
            return apiResponse.error('Unauthorized', 403);
        }

        const priceHistory = await services.competitor.getPriceHistory(params.id, days);

        return apiResponse.success(priceHistory);
    } catch (error: any) {
        console.error(`GET /api/competitors/${params.id}/prices error:`, error);
        return apiResponse.error(error.message || 'Failed to fetch price history', 500);
    }
}
