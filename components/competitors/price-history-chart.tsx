"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PricePoint {
    timestamp: Date;
    price: number;
}

interface PriceHistoryChartProps {
    priceHistory: PricePoint[];
    competitorTitle?: string;
}

export function PriceHistoryChart({ priceHistory, competitorTitle }: PriceHistoryChartProps) {
    if (priceHistory.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center border border-stroke rounded bg-glass">
                <p className="text-small text-charcoal">
                    No price history available yet
                </p>
            </div>
        );
    }

    // Transform data for chart
    const chartData = priceHistory.map(p => ({
        date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: p.price,
    }));

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" />
                    <XAxis
                        dataKey="date"
                        stroke="#6B6B6B"
                        style={{ fontSize: '11px', fontFamily: 'Inter' }}
                    />
                    <YAxis
                        stroke="#6B6B6B"
                        style={{ fontSize: '11px', fontFamily: 'Inter' }}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FAF7F1',
                            border: '1px solid #D4CFC1',
                            borderRadius: '8px',
                            fontSize: '13px'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, competitorTitle || 'Price']}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#8A1B2E"
                        strokeWidth={2}
                        dot={{ fill: '#8A1B2E', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
