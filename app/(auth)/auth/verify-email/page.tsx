export const metadata = {
  title: "Verify email",
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-primary">Email verification</p>
        <h1 className="text-2xl font-semibold">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification link. Open it to activate your AuthorStack account.
        </p>
      </div>
    </div>
  );
}

