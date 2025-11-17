import Link from "next/link";

import { SignInForm } from "@/components/forms/sign-in-form";
import { siteConfig } from "@/lib/config/site";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase text-primary">{siteConfig.name}</p>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the AuthorStack dashboard.
        </p>
      </div>
      <SignInForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/forgot-password" className="text-primary">
          Forgot your password?
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/auth/sign-up" className="text-primary">
          Create an account.
        </Link>
      </p>
    </div>
  );
}

