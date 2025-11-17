"use server";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function connectPlatformAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  return { success: false, message: "Platform connection not implemented yet." };
}

export async function uploadKdpReportAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  return { success: true, message: "Report queued for ingestion." };
}

