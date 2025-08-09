import { markObjectUploadDone } from "@/actions/oss/mark-upload-done";

export async function updateUploadStatus(objectId: string): Promise<void> {
  try {
    await markObjectUploadDone(objectId);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to update upload status");
  }
}
