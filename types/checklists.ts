export type ChecklistStatus = "not_started" | "in_progress" | "complete";

export interface ChecklistTask {
  id: string;
  title: string;
  status: ChecklistStatus;
  dueDate?: string;
}

export interface LaunchChecklist {
  id: string;
  name: string;
  launchDate?: string;
  tasks: ChecklistTask[];
}

