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
        const competitor = await services.competitor.getCompetitorDetails(params.id);

        if (!competitor) {
            return apiResponse.error('Competitor not found', 404);
        }

        // Verify ownership
        if (competitor.profileId !== user.id) {
            return apiResponse.error('Unauthorized', 403);
        }

        return apiResponse.success(competitor);
    } catch (error: any) {
        console.error(`GET /api/competitors/${params.id} error:`, error);
        return apiResponse.error(error.message || 'Failed to fetch competitor', 500);
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const body = await req.json();

        // Verify ownership first
        const existing = await services.competitor.getCompetitorDetails(params.id);
        if (!existing || existing.profileId !== user.id) {
            return apiResponse.error('Unauthorized', 403);
        }

        const updated = await services.competitor.updateCompetitor(params.id, body);

        return apiResponse.success(updated);
    } catch (error: any) {
        console.error(`PATCH /api/competitors/${params.id} error:`, error);
        return apiResponse.error(error.message || 'Failed to update competitor', 500);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();

        // Verify ownership first
        const existing = await services.competitor.getCompetitorDetails(params.id);
        if (!existing || existing.profileId !== user.id) {
            return apiResponse.error('Unauthorized', 403);
        }

        await services.competitor.deleteCompetitor(params.id);

        return apiResponse.success({ message: 'Competitor deleted successfully' });
    } catch (error: any) {
        console.error(`DELETE /api/competitors/${params.id} error:`, error);
        return apiResponse.error(error.message || 'Failed to delete competitor', 500);
    }
}
