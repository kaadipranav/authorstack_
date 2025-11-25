"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Sparkles, TrendingUp, BookOpen, Zap } from "lucide-react";

const loadingTips = [
  "AI is analyzing your sales patterns across all platforms...",
  "Syncing data from Amazon KDP, Gumroad, and more...",
  "Generating predictive insights for your next 30 days...",
  "Calculating your competitive position in the market...",
  "Preparing personalized recommendations...",
  "Loading your publishing intelligence dashboard...",
];

const features = [
  { icon: Sparkles, text: "AI-Powered Insights" },
  { icon: TrendingUp, text: "Revenue Forecasting" },
  { icon: BookOpen, text: "9+ Platform Sync" },
  { icon: Zap, text: "Real-Time Analytics" },
];

export default function Loading() {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate tips every 2.5 seconds
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 2500);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 150);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-paper flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        {/* Logo with pulse animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative">
              <Logo width={80} height={80} className="animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-center text-2xl font-bold text-ink mb-2">
          AuthorStack
        </h1>
        <p className="text-center text-sm text-charcoal mb-8">
          AI-Native Publishing Intelligence
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-glass rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-burgundy to-burgundy/70 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-charcoal text-center mt-2">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Loading tip with fade animation */}
        <div className="mb-8 h-12 flex items-center justify-center">
          <p
            key={tipIndex}
            className="text-sm text-center text-charcoal animate-fade-in"
          >
            {loadingTips[tipIndex]}
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-surface/50 border border-stroke"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <Icon className="h-4 w-4 text-burgundy" />
                <span className="text-xs text-ink">{feature.text}</span>
              </div>
            );
          })}
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-burgundy"
              style={{
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

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
