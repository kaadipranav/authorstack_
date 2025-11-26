import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { AppLayout } from "@/components/layout/app-layout";
import { OnboardingProvider } from "@/components/providers/onboarding-provider";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuth();
  const profile = await getCurrentProfile();
  
  // Check if user is new (created within last 5 minutes)
  const isNewUser = profile?.created_at 
    ? (Date.now() - new Date(profile.created_at).getTime()) < 5 * 60 * 1000
    : false;

  return (
    <OnboardingProvider userName={profile?.full_name ?? undefined} isNewUser={isNewUser}>
      <AppLayout>
        {children}
      </AppLayout>
    </OnboardingProvider>
  );
}

