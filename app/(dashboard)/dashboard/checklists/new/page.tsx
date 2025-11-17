import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChecklistForm } from "@/features/checklists/components/checklist-form";

export default function NewChecklistPage() {
  return (
    <DashboardShell
      title="Create launch checklist"
      description="Outline major milestones for your upcoming release."
    >
      <ChecklistForm mode="create" />
    </DashboardShell>
  );
}

