"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Plug,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  ChevronRight
} from "lucide-react";

interface OnboardingWizardProps {
  userName?: string;
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: "welcome",
    title: "Welcome to AuthorStack!",
    icon: Sparkles,
  },
  {
    id: "connect",
    title: "Connect Your Platforms",
    icon: Plug,
  },
  {
    id: "book",
    title: "Add Your First Book",
    icon: BookOpen,
  },
];

const platforms = [
  { name: "Amazon KDP", description: "Import via CSV upload", available: true },
  { name: "Gumroad", description: "OAuth connection", available: true },
  { name: "Payhip", description: "API integration", available: true },
  { name: "Lulu", description: "API integration", available: true },
  { name: "Kobo", description: "CSV upload", available: true },
  { name: "Apple Books", description: "CSV upload", available: true },
];

export function OnboardingWizard({ userName, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-stroke shadow-2xl">
        {/* Header with progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index < currentStep
                      ? "bg-forest text-surface"
                      : index === currentStep
                      ? "bg-burgundy text-surface"
                      : "bg-glass text-charcoal"
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
              ))}
            </div>
            <button
              onClick={onSkip}
              className="text-sm text-charcoal hover:text-ink flex items-center gap-1"
            >
              Skip setup
              <X className="h-4 w-4" />
            </button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step Content */}
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-burgundy" />
              </div>
              <h2 className="text-3xl font-serif text-ink mb-4">
                Welcome{userName ? `, ${userName}` : ""}! 🎉
              </h2>
              <p className="text-lg text-charcoal mb-6 max-w-md mx-auto">
                Let&apos;s get you set up in just a few minutes. We&apos;ll help you connect your
                sales platforms and add your first book.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
                <div className="p-4 rounded-lg bg-glass">
                  <p className="text-2xl font-bold text-burgundy">1</p>
                  <p className="text-xs text-charcoal">Connect platforms</p>
                </div>
                <div className="p-4 rounded-lg bg-glass">
                  <p className="text-2xl font-bold text-burgundy">2</p>
                  <p className="text-xs text-charcoal">Add a book</p>
                </div>
                <div className="p-4 rounded-lg bg-glass">
                  <p className="text-2xl font-bold text-burgundy">3</p>
                  <p className="text-xs text-charcoal">Get insights</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-4">
                  <Plug className="h-8 w-8 text-burgundy" />
                </div>
                <h2 className="text-2xl font-serif text-ink mb-2">Connect Your Platforms</h2>
                <p className="text-charcoal">
                  Connect your sales platforms to start tracking your revenue.
                </p>
              </div>

              <div className="grid gap-3 mb-6">
                {platforms.map((platform) => (
                  <Link
                    key={platform.name}
                    href="/dashboard/connections"
                    className="flex items-center justify-between p-4 rounded-lg border border-stroke hover:border-burgundy/30 hover:bg-burgundy/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-glass flex items-center justify-center">
                        <Plug className="h-5 w-5 text-charcoal" />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{platform.name}</p>
                        <p className="text-xs text-charcoal">{platform.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-charcoal group-hover:text-burgundy transition-colors" />
                  </Link>
                ))}
              </div>

              <p className="text-center text-sm text-charcoal">
                Don&apos;t worry, you can always add more platforms later in Settings → Integrations
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-burgundy" />
                </div>
                <h2 className="text-2xl font-serif text-ink mb-2">Add Your First Book</h2>
                <p className="text-charcoal">
                  Add a book to start tracking its performance across platforms.
                </p>
              </div>

              <div className="bg-glass rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-24 bg-gradient-to-br from-burgundy/20 to-burgundy/5 rounded-lg flex items-center justify-center border border-stroke">
                    <BookOpen className="h-8 w-8 text-burgundy/50" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Your book title</p>
                    <p className="text-sm text-charcoal">Add cover, description, and metadata</p>
                  </div>
                </div>
                <Button asChild className="w-full bg-burgundy hover:bg-burgundy/90 text-surface">
                  <Link href="/dashboard/books">
                    Add Your First Book
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-charcoal mb-2">What you&apos;ll be able to do:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-xs bg-forest/10 text-forest px-3 py-1 rounded-full">
                    Track sales across platforms
                  </span>
                  <span className="text-xs bg-forest/10 text-forest px-3 py-1 rounded-full">
                    Get AI insights
                  </span>
                  <span className="text-xs bg-forest/10 text-forest px-3 py-1 rounded-full">
                    Revenue forecasting
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer with navigation */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="border-stroke"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-burgundy hover:bg-burgundy/90 text-surface"
          >
            {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
