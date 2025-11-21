import { SignUpForm } from "@/components/forms/sign-up-form";
import GoogleSignInButton from "@/components/auth/google-signin-button";

export const metadata = {
  title: "Create AuthorStack Account",
  description: "Join AuthorStack to manage your book launches",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-auth-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-burgundy/10 bg-surface p-8 shadow-xl">
        <SignUpForm />
        <div className="flex items-center justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}