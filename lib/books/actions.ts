"use server";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createBookAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  return { success: false, message: "Book creation not implemented yet." };
}

export async function updateBookAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  return { success: false, message: "Book update not implemented yet." };
}

