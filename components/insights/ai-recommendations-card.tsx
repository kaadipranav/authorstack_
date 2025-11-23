"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Calendar, Target } from "lucide-react";

interface AIRecommendation {
    type: 'pricing' | 'timing' | 'category' | 'marketing';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
}

interface AIRecommendationsCardProps {
    recommendations: AIRecommendation[];
}

const iconMap = {
    pricing: TrendingUp,
    timing: Calendar,
    category: Target,
    marketing: Lightbulb,
};

const priorityColors = {
    high: "bg-danger/10 text-danger border-danger/20",
    medium: "bg-amber/10 text-amber border-amber/20",
    low: "bg-forest/10 text-forest border-forest/20",
};

export function AIRecommendationsCard({ recommendations }: AIRecommendationsCardProps) {
    return (
        <Card className="border-stroke bg-surface">
            <CardHeader>
                <CardTitle className="text-heading-2 text-ink flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-burgundy" />
                    AI Recommendations
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {recommendations.length === 0 ? (
                    <p className="text-body text-charcoal text-center py-8">
                        No recommendations available yet. Add more data to get insights.
                    </p>
                ) : (
                    recommendations.map((rec, index) => {
                        const Icon = iconMap[rec.type];
                        return (
                            <div
                                key={index}
                                className="p-4 rounded-lg border border-stroke bg-glass hover:bg-paper transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <Icon className="h-5 w-5 text-burgundy" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-body font-semibold text-ink">
                                                {rec.title}
                                            </h4>
                                            <Badge
                                                variant="outline"
                                                className={`text-mini px-2 py-0.5 ${priorityColors[rec.priority]}`}
                                            >
                                                {rec.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-small text-charcoal">
                                            {rec.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
