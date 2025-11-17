import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChecklistForm } from "@/features/checklists/components/checklist-form";

type ChecklistDetailsProps = {
  params: { checklistId: string };
};

const mockChecklist = {
  id: "launch-1",
  name: "Spring Launch",
  tasks: [
    { id: "task-1", title: "Finalize cover art", status: "in_progress" },
    { id: "task-2", title: "Upload KDP assets", status: "not_started" },
  ],
};

export default function ChecklistDetailsPage({ params }: ChecklistDetailsProps) {
  if (!params.checklistId) {
    notFound();
  }

  const checklist = mockChecklist;

  return (
    <DashboardShell
      title={checklist.name}
      description="Task statuses sync with Supabase in the production build."
    >
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Mark complete to keep launches on track.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">Status: {task.status}</p>
              </div>
              <button className="text-sm text-primary">Toggle</button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Update checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ChecklistForm mode="update" checklistId={checklist.id} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

