import Link from "next/link";

import { PasswordResetForm } from "@/components/forms/password-reset-form";

export const metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase text-primary">Password reset</p>
        <h1 className="text-2xl font-semibold">Send a reset link</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you instructions to recover access.
        </p>
      </div>
      <PasswordResetForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary">
          Return to sign in
        </Link>
      </p>
    </div>
  );
}

