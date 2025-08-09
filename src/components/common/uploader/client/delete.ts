import { deleteObject } from "@/actions/oss/delete";

export async function deleteStorageObject(objectId: string): Promise<boolean> {
  try {
    await deleteObject(objectId);
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error(error instanceof Error ? error.message : "Delete failed");
  }
}
