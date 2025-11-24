"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, Calendar, Check, ArrowRight, Sparkles, Target, BarChart3, Zap, Shield, Globe } from "lucide-react";

// Mock book covers data
const bookCovers = [
  {
    id: 1,
    title: "The Silent Garden",
    cover: "silent_garden_cover.png",
    badge: "#2 in YA Debuts",
    stacks: 147,
  },
  {
    id: 2,
    title: "Midnight Protocol",
    cover: "midnight_protocol_cover.png",
    badge: "#1 in Techno-thriller",
    stacks: 289,
  },
  {
    id: 3,
    title: "Echoes of Tomorrow",
    cover: "echoes_tomorrow_cover.png",
    badge: "#5 in Sci-Fi Romance",
    stacks: 203,
  },
];

// Live feed messages
const feedMessages = [
  "> AI detected revenue spike • 34% above forecast • $1,247 earned today",
  "> gumroad sync complete • 12 sales • AI recommends price increase",
  "> churn risk identified • 3 books declining • smart alerts sent",
  "> amazon kdp • 47 units sold • ML predicts +22% next week",
];

const features = [
  {
    icon: BookOpen,
    title: "Unified Dashboard",
    description: "Connect Amazon KDP, Gumroad, Payhip, Lulu, and 9+ platforms. One view for all your sales channels with real-time sync.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Chat with your personal AI publishing consultant. Get instant answers about your sales data, trends, and strategic recommendations.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "ML-powered revenue forecasts, churn detection, and engagement scoring. Know what's coming before it happens.",
  },
  {
    icon: Target,
    title: "Smart Recommendations",
    description: "AI-driven pricing strategies, marketing suggestions, and competitor insights. Make data-driven decisions with confidence.",
  },
  {
    icon: Calendar,
    title: "Launch Playbooks",
    description: "Structured checklists with deadlines, owners, and automated reminders. Ship your next book on time, every time.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track revenue, units sold, and momentum across all platforms. AI-generated insights spot trends before they become problems.",
  },
];

const testimonials = [
  {
    quote: "The AI predictions are scary accurate. It warned me about a sales dip 2 weeks before it happened. Now I can adjust my marketing proactively instead of reactively.",
    name: "Casey Lin",
    role: "Romantasy author, 6x Amazon Top 100",
  },
  {
    quote: "I chat with the AI assistant daily. It's like having a publishing consultant who knows my entire back catalog and can pull insights in seconds. Absolutely game-changing.",
    name: "Mahesh Rao",
    role: "Non-fiction indie author",
  },
  {
    quote: "The AI recommendations increased my revenue by 23% in the first month. It suggested pricing changes I never would have thought of and backed them up with data.",
    name: "Sarah Chen",
    role: "Sci-fi series author",
  },
];

const platforms = [
  "Amazon KDP",
  "Gumroad",
  "Payhip",
  "Lulu",
  "Kobo Writing Life",
  "Apple Books",
  "Google Play Books",
  "Barnes & Noble Press",
  "Whop",
];

export default function LandingPage() {
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for watermark rotation
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentMessage = feedMessages[currentFeedIndex];

    if (isTyping && displayedText.length < currentMessage.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
      }, 45);
      return () => clearTimeout(timeout);
    } else if (isTyping && displayedText.length === currentMessage.length) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setDisplayedText("");
        setCurrentFeedIndex((prev) => (prev + 1) % feedMessages.length);
        setIsTyping(true);
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isTyping, currentFeedIndex]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Book carousel auto-rotate
  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setCurrentBookIndex((prev) => (prev + 1) % bookCovers.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isHovering]);

  const currentBook = bookCovers[currentBookIndex];
  const isComplete = displayedText.length === feedMessages[currentFeedIndex].length;

  return (
    <div className="bg-paper">

      {/* Ink-blot watermark - bottom right */}
      <div
        className="fixed bottom-8 right-8 pointer-events-none z-0 opacity-10 transition-transform duration-100"
        style={{
          transform: scrollY > 0 ? `rotate(${(scrollY / 200) * 0.5}deg)` : undefined,
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 10C35 10 25 20 25 35C25 45 30 50 35 55C32 58 30 62 30 67C30 75 35 82 45 85C42 88 40 92 40 97C40 100 42 102 45 102C48 102 50 100 50 97C50 92 48 88 45 85C55 82 60 75 60 67C60 62 58 58 55 55C60 50 65 45 65 35C65 20 55 10 50 10Z"
            fill="#11110F"
            opacity="0.8"
          />
          <circle cx="50" cy="35" r="8" fill="#11110F" opacity="0.6" />
          <ellipse cx="45" cy="67" rx="6" ry="8" fill="#11110F" opacity="0.5" />
          <path
            d="M35 45C38 48 42 50 46 50C50 50 54 48 57 45"
            stroke="#11110F"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-6 py-20 max-w-6xl">

          {/* Live Data Feed */}
          <div className="mb-16" aria-live="polite" aria-atomic="true">
            <div className="font-mono text-sm md:text-base h-20 flex items-center bg-surface/50 backdrop-blur-sm border border-stroke rounded-lg px-6 shadow-sm">
              <span
                className={`transition-colors duration-300 ${isComplete ? "text-ink" : "text-charcoal"
                  }`}
              >
                {displayedText}
                {showCursor && <span className="inline-block w-2 h-4 bg-burgundy ml-1 animate-pulse" />}
              </span>
            </div>
          </div>

          {/* Serif headline */}
          <h1
            className="font-serif text-5xl md:text-6xl lg:text-7xl text-ink mb-6 leading-[1.1] tracking-tight"
            style={{ fontFamily: "Merriweather, serif" }}
          >
            AI-Powered Intelligence<br />for Indie Authors.
          </h1>

          <p className="text-xl md:text-2xl text-charcoal mb-12 max-w-3xl leading-relaxed">
            The first AI-native publishing dashboard. Track sales across 9+ platforms, get predictive insights, and launch smarter with ML-powered recommendations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Button
              asChild
              size="lg"
              className="bg-burgundy hover:bg-burgundy/90 text-surface px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/auth/sign-up">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-stroke text-ink hover:bg-glass px-8 py-6 text-lg transition-all duration-300"
            >
              <Link href="/auth/sign-in">Already have an account?</Link>
            </Button>
          </div>

          {/* Dynamic book carousel */}
          <div className="flex justify-center">
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onFocus={() => setIsHovering(true)}
              onBlur={() => setIsHovering(false)}
              tabIndex={0}
              role="img"
              aria-label={`Book cover: ${currentBook.title}`}
            >
              <div
                className="w-64 h-96 md:w-80 md:h-[480px] bg-gradient-to-br from-surface to-glass border-2 border-stroke rounded-xl shadow-lg transition-all duration-600 overflow-hidden"
                style={{
                  transform: isHovering ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: isHovering
                    ? "0 20px 40px rgba(17,17,15,0.12)"
                    : "0 8px 16px rgba(17,17,15,0.06)",
                  transitionTimingFunction: "cubic-bezier(.2,.9,.2,1)",
                }}
              >
                <Image
                  src={`/${currentBook.cover}`}
                  alt={currentBook.title}
                  width={320}
                  height={480}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              <div
                className="absolute -top-4 -right-4 bg-amber text-ink px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg border-2 border-surface"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {currentBook.badge} • {currentBook.stacks} Stacks
              </div>

              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
                {bookCovers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBookIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentBookIndex ? "bg-burgundy w-8" : "bg-stroke w-2"
                      }`}
                    aria-label={`View book ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-surface border-y border-stroke py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl text-ink mb-6 leading-tight">
              AI-Native Publishing Platform<br />Built for Modern Authors
            </h2>
            <p className="text-xl text-charcoal max-w-2xl mx-auto">
              From predictive analytics to AI chat assistance, AuthorStack brings enterprise-grade intelligence to indie publishing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border-2 border-stroke bg-surface hover:shadow-xl hover:border-burgundy/20 transition-all duration-300 hover:-translate-y-2 group"
                >
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-burgundy/10 flex items-center justify-center mb-6 group-hover:bg-burgundy/20 transition-colors duration-300">
                      <Icon className="h-7 w-7 text-burgundy" />
                    </div>
                    <CardTitle className="text-2xl group-hover:text-burgundy transition-colors duration-300">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-charcoal leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-ink mb-4">
              9+ Platform Integrations. One Dashboard.
            </h2>
            <p className="text-lg text-charcoal">
              Real OAuth connections + API integrations. No manual CSV uploads required.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform}
                className="bg-surface border border-stroke rounded-lg p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-sm font-medium text-ink">{platform}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Deep Dive */}
      <section className="relative z-10 bg-surface border-y border-stroke py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-burgundy/10 border border-burgundy/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-burgundy" />
              <span className="text-sm font-semibold text-burgundy">Powered by GPT-4 & Claude</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-ink mb-4">
              Intelligence That Scales With You
            </h2>
            <p className="text-lg text-charcoal max-w-2xl mx-auto">
              Our AI layer learns from your data to provide increasingly accurate predictions and recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-stroke bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-burgundy" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-2">AI Chat Assistant</h3>
                  <p className="text-charcoal mb-4">
                    Ask questions in plain English. "Why did sales drop last week?" or "Which book should I promote next?" 
                    Get instant, context-aware answers from your personal publishing AI.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Context-aware</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Multi-turn conversations</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Data grounded</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-2 border-stroke bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-burgundy" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-2">Revenue Forecasting</h3>
                  <p className="text-charcoal mb-4">
                    ML models predict your next 30-90 days of revenue with confidence scores. 
                    See which books will perform, identify at-risk titles, and plan accordingly.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">30/60/90 day forecasts</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Confidence scores</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Churn detection</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-2 border-stroke bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-burgundy" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-2">Smart Recommendations</h3>
                  <p className="text-charcoal mb-4">
                    AI analyzes your catalog and suggests pricing optimizations, marketing strategies, and 
                    cross-promotion opportunities. Each recommendation includes projected impact.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Pricing strategies</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Marketing tactics</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">ROI estimates</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-2 border-stroke bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-burgundy" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-2">Automated Insights</h3>
                  <p className="text-charcoal mb-4">
                    Wake up to daily briefings on sales trends, competitor movements, and performance alerts. 
                    The AI monitors everything 24/7 so you don't have to.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Daily briefings</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Anomaly detection</span>
                    <span className="text-xs bg-glass border border-stroke rounded px-2 py-1">Priority scoring</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-charcoal mb-6">
              <Shield className="inline h-5 w-5 mr-2 text-burgundy" />
              Your data never trains external models. All AI processing respects your privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 bg-surface border-y border-stroke py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-ink mb-4">
              Trusted by indie authors
            </h2>
            <p className="text-lg text-charcoal">
              Publishing on their own terms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-stroke bg-surface">
                <CardContent className="pt-6">
                  <p className="text-ink italic mb-4">"{testimonial.quote}"</p>
                  <div className="border-t border-stroke pt-4">
                    <p className="font-medium text-ink">{testimonial.name}</p>
                    <p className="text-sm text-charcoal">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="font-serif text-3xl md:text-5xl text-ink mb-6">
            Stop guessing. Start knowing.
          </h2>
          <p className="text-xl text-charcoal mb-12 max-w-2xl mx-auto">
            Join the authors using AI to make smarter publishing decisions. Connect your platforms, get your first AI insights in minutes, and watch your revenue grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-burgundy hover:bg-burgundy/90 text-surface px-8 py-6 text-lg"
            >
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-stroke text-ink hover:bg-glass px-8 py-6 text-lg"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </div>
          <p className="text-sm text-charcoal mt-6">
            Free tier includes 2 platform connections • No credit card required
          </p>
        </div>
      </section>

      {/* Bottom CTA Bar - Sticky */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-surface/95 border-t border-stroke py-4 px-6 z-50 backdrop-blur-sm"
      >
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-burgundy" />
            <div
              className="font-serif text-ink text-sm md:text-base"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Get AI-powered insights in minutes
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              asChild
              className="bg-burgundy hover:bg-burgundy/90 text-surface px-6 py-2 rounded-lg font-medium"
            >
              <Link href="/auth/sign-up">Start Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-stroke text-ink hover:bg-glass px-6 py-2 rounded-lg font-medium"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </div>

          <div
            className="flex items-center gap-2 text-xs text-charcoal"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            AI monitoring active
          </div>
        </div>
      </div>
    </div>
  );
}
