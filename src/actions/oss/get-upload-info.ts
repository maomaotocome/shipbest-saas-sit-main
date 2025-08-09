"use server";

import { getUser } from "@/lib/auth/utils";
import { getUploadInfo } from "@/services/oss";
import { FileUploadInfo } from "@/types/oss";

export async function getUploadObjectInfo(fileInfo: FileUploadInfo) {
  try {
    const user = await getUser();
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    const uploadInfo = await getUploadInfo({ userId: user.id, fileInfo });
    return {
      result: "success",
      data: uploadInfo,
    };
  } catch (error) {
    console.error("Failed to get upload info", error);
    throw new Error("Failed to get upload info");
  }
}
