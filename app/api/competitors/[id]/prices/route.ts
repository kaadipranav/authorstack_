import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { services } from '@/lib/services';
import { successResponse, errorResponse } from '@/lib/api/responses';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Verify ownership
        const competitor = await services.competitor.getCompetitorDetails(id);
        if (!competitor || competitor.profileId !== user.id) {
            return errorResponse('Unauthorized', undefined, 403);
        }

        const priceHistory = await services.competitor.getPriceHistory(id, days);

        return successResponse(priceHistory);
    } catch (error: any) {
        console.error(`GET /api/competitors/[id]/prices error:`, error);
        return errorResponse(error.message || 'Failed to fetch price history', undefined, 500);
    }
}
