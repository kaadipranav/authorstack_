"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp, BarChart3 } from "lucide-react";

const dashboardTips = [
  "Preparing your sales analytics...",
  "Loading AI-powered insights...",
  "Syncing platform data...",
  "Calculating revenue trends...",
];

export default function DashboardLoading() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % dashboardTips.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header with animated tip */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48" />
          <Sparkles className="h-5 w-5 text-burgundy animate-pulse" />
        </div>
        <p
          key={tipIndex}
          className="text-sm text-charcoal animate-fade-in"
        >
          {dashboardTips[tipIndex]}
        </p>
      </div>

      {/* Stats cards with staggered animation */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-surface p-6 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center gap-3 mb-4">
              {i === 0 && <TrendingUp className="h-5 w-5 text-burgundy/50" />}
              {i === 1 && <BarChart3 className="h-5 w-5 text-burgundy/50" />}
              {i === 2 && <Sparkles className="h-5 w-5 text-burgundy/50" />}
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="rounded-lg border bg-surface p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-burgundy animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-12 w-full"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
