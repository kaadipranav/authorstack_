import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { services } from '@/lib/services';
import { apiResponse } from '@/lib/api/responses';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        const dashboard = await services.insights.getDashboard(user.id, days);

        return apiResponse.success(dashboard);
    } catch (error: any) {
        console.error('GET /api/insights error:', error);
        return apiResponse.error(error.message || 'Failed to fetch insights', 500);
    }
}
