"use server";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createChecklistAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  return { success: false, message: "Checklist creation not implemented yet." };
}

export async function updateChecklistTaskAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  return { success: false, message: "Checklist task update not implemented yet." };
}

