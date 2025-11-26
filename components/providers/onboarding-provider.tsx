"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

interface OnboardingContextType {
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
  userName?: string;
  isNewUser?: boolean;
}

const ONBOARDING_KEY = "authorstack_onboarding_complete";

export function OnboardingProvider({ children, userName, isNewUser }: OnboardingProviderProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if onboarding has been completed
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    
    // Show onboarding if it's a new user and hasn't completed it
    if (isNewUser && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [isNewUser]);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <OnboardingContext.Provider value={{ showOnboarding, setShowOnboarding, completeOnboarding }}>
      {children}
      {showOnboarding && (
        <OnboardingWizard
          userName={userName}
          onComplete={completeOnboarding}
          onSkip={handleSkip}
        />
      )}
    </OnboardingContext.Provider>
  );
}
