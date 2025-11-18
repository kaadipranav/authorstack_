import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuth();
  return <div className="bg-muted/10">{children}</div>;
}

