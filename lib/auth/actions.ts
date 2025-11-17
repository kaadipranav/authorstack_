"use server";

import { env } from "@/lib/env";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function signInAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  void env;
  return {
    success: false,
    message: "Sign in logic not implemented yet.",
  };
}

export async function signUpAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  void env;
  return {
    success: false,
    message: "Sign up logic not implemented yet.",
  };
}

export async function requestPasswordResetAction(formData: FormData): Promise<ActionResponse> {
  void formData;
  void env;
  return {
    success: true,
    message: "If this email exists, a reset link will be sent.",
  };
}

