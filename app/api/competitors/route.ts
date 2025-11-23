import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { services } from '@/lib/services';
import { apiResponse } from '@/lib/api/responses';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        const competitors = await services.competitor.getMyCompetitors(user.id);

        return apiResponse.success(competitors);
    } catch (error: any) {
        console.error('GET /api/competitors error:', error);
        return apiResponse.error(error.message || 'Failed to fetch competitors', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await req.json();

        const { asin, title, author, category, format, imageUrl } = body;

        if (!asin || !title) {
            return apiResponse.error('ASIN and title are required', 400);
        }

        const competitor = await services.competitor.addCompetitor(user.id, {
            asin,
            title,
            author,
            category,
            format,
            imageUrl,
        });

        return apiResponse.success(competitor, 201);
    } catch (error: any) {
        console.error('POST /api/competitors error:', error);
        return apiResponse.error(error.message || 'Failed to add competitor', 500);
    }
}
