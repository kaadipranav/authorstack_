"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Star } from "lucide-react";
import Image from "next/image";

interface CompetitorCardProps {
    id: string;
    asin: string;
    title: string;
    author?: string;
    imageUrl?: string;
    currentPrice?: number;
    currentBsr?: number;
    currentRating?: number;
    currentReviewCount?: number;
    priceChange?: number; // percentage
    onViewDetails: (id: string) => void;
}

export function CompetitorCard({
    id,
    asin,
    title,
    author,
    imageUrl,
    currentPrice,
    currentBsr,
    currentRating,
    currentReviewCount,
    priceChange,
    onViewDetails,
}: CompetitorCardProps) {
    return (
        <Card
            className="border-stroke bg-surface hover:bg-glass transition-colors cursor-pointer"
            onClick={() => onViewDetails(id)}
        >
            <CardHeader className="pb-3">
                <div className="flex gap-4">
                    {/* Book cover */}
                    <div className="flex-shrink-0">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={title}
                                width={80}
                                height={120}
                                className="rounded border border-stroke object-cover"
                            />
                        ) : (
                            <div className="w-20 h-30 bg-glass rounded border border-stroke flex items-center justify-center">
                                <TrendingUp className="h-8 w-8 text-charcoal" />
                            </div>
                        )}
                    </div>

                    {/* Book info */}
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-heading-3 text-ink line-clamp-2">
                            {title}
                        </CardTitle>
                        {author && (
                            <CardDescription className="text-small text-charcoal mt-1">
                                by {author}
                            </CardDescription>
                        )}
                        <p className="text-mini text-charcoal mt-1">ASIN: {asin}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Price and change */}
                <div className="flex items-baseline justify-between">
                    <div>
                        <p className="text-small text-charcoal">Price</p>
                        <p className="text-heading-3 font-bold text-ink">
                            {currentPrice ? `$${currentPrice.toFixed(2)}` : 'N/A'}
                        </p>
                    </div>
                    {priceChange !== undefined && (
                        <Badge
                            variant={priceChange < 0 ? "default" : "secondary"}
                            className="text-mini gap-1 px-2.5 py-0.5"
                        >
                            {priceChange < 0 ? (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                            ) : (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                            {Math.abs(priceChange).toFixed(1)}%
                        </Badge>
                    )}
                </div>

                {/* BSR and Rating */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stroke">
                    <div>
                        <p className="text-mini text-charcoal">BSR</p>
                        <p className="text-body font-semibold text-ink">
                            {currentBsr ? `#${currentBsr.toLocaleString()}` : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-mini text-charcoal">Rating</p>
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber text-amber" />
                            <p className="text-body font-semibold text-ink">
                                {currentRating ? currentRating.toFixed(1) : 'N/A'}
                            </p>
                            {currentReviewCount && (
                                <span className="text-mini text-charcoal">
                                    ({currentReviewCount.toLocaleString()})
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sparkline placeholder */}
                <div className="h-12 w-full mt-2">
                    <div className="relative h-full w-full overflow-hidden rounded-md border border-stroke bg-gradient-to-b from-burgundy/10 via-transparent to-transparent">
                        {/* Simple mock sparkline - in real implementation, use actual price history data */}
                        <div className="absolute inset-0 flex items-end justify-between px-1">
                            {[60, 75, 55, 80, 70, 85, 65, 90, 75, 80].map((value, index) => (
                                <div
                                    key={index}
                                    className="w-1 rounded-t bg-burgundy/80"
                                    style={{ height: `${value}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
