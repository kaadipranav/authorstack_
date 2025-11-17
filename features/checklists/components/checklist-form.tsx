"use client";

import { useState } from "react";

import { FormSubmit } from "@/components/forms/form-submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createChecklistAction,
  updateChecklistTaskAction,
} from "@/lib/checklists/actions";

type ChecklistFormProps = {
  mode?: "create" | "update";
  checklistId?: string;
};

export function ChecklistForm({ mode = "create", checklistId }: ChecklistFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const action = mode === "create" ? createChecklistAction : updateChecklistTaskAction;
    if (checklistId) {
      formData.append("checklistId", checklistId);
    }
    const result = await action(formData);
    setMessage(result.message);
  }

  return (
    <form action={handleAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Launch name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="launchDate">Target launch date</Label>
        <Input id="launchDate" name="launchDate" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <FormSubmit pendingLabel={mode === "create" ? "Creating..." : "Updating..."}>
        {mode === "create" ? "Create checklist" : "Update checklist"}
      </FormSubmit>
    </form>
  );
}

