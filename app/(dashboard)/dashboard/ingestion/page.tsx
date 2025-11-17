import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const jobs = [
  { name: "Nightly sales sync", schedule: "02:00 UTC", status: "enabled" },
  { name: "Manual CSV uploads", schedule: "On demand", status: "pending files" },
];

export default function IngestionPage() {
  return (
    <DashboardShell
      title="Ingestion jobs"
      description="Manage cron schedules, manual syncs, and retry operations."
    >
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.name}>
            <CardHeader>
              <CardTitle>{job.name}</CardTitle>
              <CardDescription>
                Schedule: {job.schedule} • Status: {job.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline">Run now</Button>
              <Button variant="ghost">View logs</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

