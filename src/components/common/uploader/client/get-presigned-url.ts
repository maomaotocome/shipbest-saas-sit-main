import { getUploadObjectInfo } from "@/actions/oss/get-upload-info";
import { JsonObject } from "@/types/json";
import { GetPresignedPutUrlResult } from "@/types/oss";

export async function getPresignedUrl({
  file,
  metadata,
  isPublic,
}: {
  file: File;
  metadata?: JsonObject;
  isPublic: boolean;
}): Promise<GetPresignedPutUrlResult> {
  try {
    const result = await getUploadObjectInfo({
      filename: file.name,
      type: file.type,
      size: file.size,
      metadata,
      isPublic,
    });

    if (result.data.status === "failure") {
      throw new Error(result.data.message || "Failed to get upload URL");
    }
    if (!result.data.data) {
      throw new Error("Failed to get upload URL");
    }
    return result.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to get upload URL");
  }
}
