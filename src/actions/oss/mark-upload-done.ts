"use server";

import { getUser } from "@/lib/auth/utils";
import { markUploadDone } from "@/services/oss";

export async function markObjectUploadDone(id: string) {
  try {
    const user = await getUser();

    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    const result = await markUploadDone({ userId: user.id, id });
    return {
      result: "success",
      data: result,
    };
  } catch (error) {
    console.error("Failed to mark upload done", error);
    throw new Error("Failed to mark upload done");
  }
}
