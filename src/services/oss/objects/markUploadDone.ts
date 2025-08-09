import { markUploadDone as markUploadDoneDb } from "@/db/oss/objects";

export async function markUploadDone({ userId, id }: { userId: string; id: string }) {
  return markUploadDoneDb({ id, userId });
}
