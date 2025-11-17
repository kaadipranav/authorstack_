import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformConnectForm } from "@/features/platforms/components/platform-connect-form";

export default function WhopConnectionPage() {
  return (
    <DashboardShell
      title="Whop"
      description="Manage subscription state and listen for webhook events."
    >
      <Card>
        <CardHeader>
          <CardTitle>API credentials</CardTitle>
          <CardDescription>
            Supply the Whop API key and webhook secret used by billing webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformConnectForm provider="whop" />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

