import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card/60 p-8 shadow-sm">
        {children}
      </div>
    </main>
  );
}

