import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BookForm } from "@/features/books/components/book-form";
import { getBook } from "@/lib/books/service";

type EditBookPageProps = {
  params: { bookId: string };
};

export default async function EditBookPage({ params }: EditBookPageProps) {
  const book = await getBook(params.bookId);
  if (!book) {
    notFound();
  }

  return (
    <DashboardShell
      title="Edit book"
      description="Update metadata before syncing launch data."
    >
      <BookForm mode="edit" bookId={params.bookId} defaultValues={book} />
    </DashboardShell>
  );
}

