import Link from "next/link";

import { SignUpForm } from "@/components/forms/sign-up-form";

export const metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase text-primary">Early access</p>
        <h1 className="text-2xl font-semibold">Create your AuthorStack account</h1>
        <p className="text-sm text-muted-foreground">Supabase auth is wired up behind the scenes.</p>
      </div>
      <SignUpForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-primary">
          Sign in.
        </Link>
      </p>
    </div>
  );
}

