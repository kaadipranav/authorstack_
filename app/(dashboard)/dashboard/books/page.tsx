import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const demoBooks = [
  {
    id: "demo-book",
    title: "Your launch-ready manuscript",
    status: "draft",
    format: "ebook",
  },
];

export default function BooksPage() {
  return (
    <DashboardShell
      title="Books"
      description="Manage titles, formats, and launch readiness per SKU."
    >
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/books/new">Add book</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {demoBooks.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
              <CardDescription>
                Status: {book.status} • Format: {book.format}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/books/${book.id}`}>View</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/dashboard/books/${book.id}/edit`}>Edit</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

