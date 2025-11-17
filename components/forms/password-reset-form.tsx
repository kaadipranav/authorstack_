"use client";

import { useState } from "react";

import { FormSubmit } from "@/components/forms/form-submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/lib/auth/actions";

export function PasswordResetForm() {
  const [message, setMessage] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    const result = await requestPasswordResetAction(formData);
    setMessage(result.message);
  }

  return (
    <form action={clientAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Account email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <FormSubmit pendingLabel="Sending email...">Send reset link</FormSubmit>
    </form>
  );
}

