import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteBookAction } from "@/lib/books/actions";
import { listBooks } from "@/lib/books/service";

export default async function BooksPage() {
  const books = await listBooks();

  return (
    <DashboardShell
      title="Books"
      description="Manage titles, formats, and launch readiness per SKU."
    >
      <div className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {books.length} {books.length === 1 ? "book" : "books"}
        </div>
        <Button asChild>
          <Link href="/dashboard/books/new">Add book</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {books.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
              <CardDescription>
                Status: {book.status} • Format: {book.format}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/books/${book.id}`}>View</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/dashboard/books/${book.id}/edit`}>Edit</Link>
              </Button>
              <form action={async () => {
                "use server";
                await deleteBookAction(book.id);
              }}>
                <Button variant="destructive">Delete</Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {books.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No books yet</CardTitle>
              <CardDescription>Add your first title to start tracking sales.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </DashboardShell>
  );
}
