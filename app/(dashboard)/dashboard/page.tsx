import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const metrics = [
  { title: "Total revenue", value: "$0.00", description: "Connect platforms to populate" },
  { title: "Books in pipeline", value: "0", description: "Awaiting ingestion" },
  { title: "Tasks due", value: "0", description: "Launch checklist items" },
];

export default function DashboardHomePage() {
  return (
    <DashboardShell
      title="Command Center"
      description="High-level sales trends, launch readiness, and integration health."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader>
              <CardTitle>{metric.title}</CardTitle>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

