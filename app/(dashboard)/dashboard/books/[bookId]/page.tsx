import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type BookDetailsPageProps = {
  params: { bookId: string };
};

const mockBook = {
  id: "demo-book",
  title: "Your launch-ready manuscript",
  subtitle: "A placeholder until Supabase data flows",
  status: "draft",
  format: "ebook",
  launchDate: "2025-01-01",
  description: "Book details render here once connected to Supabase.",
};

export default function BookDetailsPage({ params }: BookDetailsPageProps) {
  if (!params.bookId) {
    notFound();
  }

  const book = mockBook; // Replace with Supabase query later

  return (
    <DashboardShell
      title={book.title}
      description="Sales metrics, ingestion events, and launch health will appear here."
    >
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Key attributes pulled from Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Status: {book.status}</p>
          <p>Format: {book.format}</p>
          <p>Launch date: {book.launchDate}</p>
          <p>{book.description}</p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

