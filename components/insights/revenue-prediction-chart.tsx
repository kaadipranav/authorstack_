"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RevenuePrediction {
    date: Date;
    predictedRevenue: number;
    confidence: number;
    lowerBound?: number;
    upperBound?: number;
}

interface RevenuePredictionChartProps {
    predictions: RevenuePrediction[];
}

export function RevenuePredictionChart({ predictions }: RevenuePredictionChartProps) {
    if (predictions.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center border border-stroke rounded bg-glass">
                <p className="text-small text-charcoal">
                    Not enough data for predictions yet
                </p>
            </div>
        );
    }

    // Transform data for chart
    const chartData = predictions.map(p => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: p.predictedRevenue,
        lower: p.lowerBound || p.predictedRevenue * 0.8,
        upper: p.upperBound || p.predictedRevenue * 1.2,
    }));

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8A1B2E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8A1B2E" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" />
                    <XAxis
                        dataKey="date"
                        stroke="#6B6B6B"
                        style={{ fontSize: '12px', fontFamily: 'Inter' }}
                    />
                    <YAxis
                        stroke="#6B6B6B"
                        style={{ fontSize: '12px', fontFamily: 'Inter' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FAF7F1',
                            border: '1px solid #D4CFC1',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="none"
                        fill="#8A1B2E"
                        fillOpacity={0.1}
                    />
                    <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="none"
                        fill="#FAF7F1"
                        fillOpacity={1}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8A1B2E"
                        strokeWidth={2}
                        dot={{ fill: '#8A1B2E', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
