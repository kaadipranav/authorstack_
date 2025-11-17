import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformConnectForm } from "@/features/platforms/components/platform-connect-form";

export default function GumroadConnectionPage() {
  return (
    <DashboardShell
      title="Gumroad"
      description="Connect Gumroad via OAuth or API key to ingest orders."
    >
      <Card>
        <CardHeader>
          <CardTitle>OAuth / API token</CardTitle>
          <CardDescription>Securely store credentials via Supabase secrets.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformConnectForm provider="gumroad" />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

