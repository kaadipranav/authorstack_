import type { ReactNode } from "react";

import { DashboardNav } from "@/components/navigation/dashboard-nav";

type DashboardShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DashboardShell({ title, description, children }: DashboardShellProps) {
  return (
    <div className="container flex flex-col gap-6 py-8 lg:flex-row">
      <aside className="w-full shrink-0 rounded-xl border bg-card/60 p-4 lg:w-64">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Navigation</p>
        </div>
        <DashboardNav />
      </aside>
      <section className="flex-1 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </header>
        <div className="rounded-xl border bg-card/50 p-6">{children}</div>
      </section>
    </div>
  );
}

