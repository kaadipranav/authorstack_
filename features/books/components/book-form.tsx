"use client";

import { useState } from "react";

import { FormSubmit } from "@/components/forms/form-submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBookAction, updateBookAction } from "@/lib/books/actions";

type BookFormProps = {
  mode?: "create" | "edit";
  bookId?: string;
};

export function BookForm({ mode = "create", bookId }: BookFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const action = mode === "create" ? createBookAction : updateBookAction;
    if (bookId) {
      formData.append("bookId", bookId);
    }
    const result = await action(formData);
    setMessage(result.message);
  }

  return (
    <form action={handleAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <select
          id="format"
          name="format"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue="ebook"
        >
          <option value="ebook">eBook</option>
          <option value="paperback">Paperback</option>
          <option value="hardcover">Hardcover</option>
          <option value="audiobook">Audiobook</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="launchDate">Launch date</Label>
        <Input id="launchDate" name="launchDate" type="date" />
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <FormSubmit pendingLabel={mode === "create" ? "Creating..." : "Saving..."}>
        {mode === "create" ? "Create book" : "Save changes"}
      </FormSubmit>
    </form>
  );
}

