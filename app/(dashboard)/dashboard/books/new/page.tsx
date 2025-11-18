export const dynamic = "force-dynamic";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BookForm } from "@/features/books/components/book-form";

export default function NewBookPage() {
  return (
    <DashboardShell
      title="Add a book"
      description="Register a manuscript so ingestion jobs can map sales data."
    >
      <BookForm mode="create" />
    </DashboardShell>
  );
}

