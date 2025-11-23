"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MarketingMetric {
    channel: string;
    spend: number;
    revenue: number;
    conversions: number;
    roi: number;
}

interface MarketingROIChartProps {
    metrics: MarketingMetric[];
}

export function MarketingROIChart({ metrics }: MarketingROIChartProps) {
    if (metrics.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center border border-stroke rounded bg-glass">
                <p className="text-small text-charcoal">
                    No marketing data available
                </p>
            </div>
        );
    }

    // Transform data for chart
    const chartData = metrics.map(m => ({
        channel: m.channel,
        roi: m.roi,
        spend: m.spend,
        revenue: m.revenue,
    }));

    // Color based on ROI performance
    const getBarColor = (roi: number) => {
        if (roi >= 3) return '#2D5016'; // forest - excellent
        if (roi >= 2) return '#8A1B2E'; // burgundy - good
        if (roi >= 1) return '#B8860B'; // amber - break even
        return '#8B0000'; // danger - losing money
    };

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" />
                    <XAxis
                        dataKey="channel"
                        stroke="#6B6B6B"
                        style={{ fontSize: '12px', fontFamily: 'Inter' }}
                    />
                    <YAxis
                        stroke="#6B6B6B"
                        style={{ fontSize: '12px', fontFamily: 'Inter' }}
                        tickFormatter={(value) => `${value}x`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FAF7F1',
                            border: '1px solid #D4CFC1',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === 'roi') return [`${value.toFixed(2)}x`, 'ROI'];
                            if (name === 'spend') return [`$${value}`, 'Spend'];
                            if (name === 'revenue') return [`$${value}`, 'Revenue'];
                            return [value, name];
                        }}
                    />
                    <Bar dataKey="roi" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.roi)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
