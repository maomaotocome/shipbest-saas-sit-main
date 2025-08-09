"use server";

import { getUser } from "@/lib/auth/utils";
import { deleteStorageObject } from "@/services/oss";

export async function deleteObject(id: string) {
  try {
    const user = await getUser();

    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    const result = await deleteStorageObject({ userId: user.id, id });
    return {
      result: "success",
      data: result,
    };
  } catch (error) {
    console.error("Failed to delete object", error);
    throw new Error("Failed to delete object");
  }
}
