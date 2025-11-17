import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  KdpUploadForm,
  PlatformConnectForm,
} from "@/features/platforms/components/platform-connect-form";

export default function AmazonKdpConnectionPage() {
  return (
    <DashboardShell
      title="Amazon KDP"
      description="Connect Kindle Direct Publishing or upload CSV exports."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API connection</CardTitle>
            <CardDescription>Use an OAuth client or vendor-provided token.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformConnectForm provider="amazon_kdp" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manual CSV uploads</CardTitle>
            <CardDescription>Queue ingestion jobs using exported spreadsheets.</CardDescription>
          </CardHeader>
          <CardContent>
            <KdpUploadForm />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

