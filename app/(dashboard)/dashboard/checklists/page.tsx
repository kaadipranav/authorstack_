import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockChecklists = [
  {
    id: "launch-1",
    name: "Spring Launch",
    tasksCompleted: 0,
    totalTasks: 5,
  },
];

export default function ChecklistsPage() {
  return (
    <DashboardShell
      title="Launch checklists"
      description="Track launch readiness tasks with due dates and reminders."
    >
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/checklists/new">New checklist</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {mockChecklists.map((checklist) => (
          <Card key={checklist.id}>
            <CardHeader>
              <CardTitle>{checklist.name}</CardTitle>
              <CardDescription>
                {checklist.tasksCompleted}/{checklist.totalTasks} tasks complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/checklists/${checklist.id}`}>View checklist</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

