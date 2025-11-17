import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BookForm } from "@/features/books/components/book-form";

type EditBookPageProps = {
  params: { bookId: string };
};

export default function EditBookPage({ params }: EditBookPageProps) {
  if (!params.bookId) {
    notFound();
  }

  return (
    <DashboardShell
      title="Edit book"
      description="Update metadata before syncing launch data."
    >
      <BookForm mode="edit" bookId={params.bookId} />
    </DashboardShell>
  );
}

