import { deleteOssObject } from "@/db/oss/objects";
import { withTransaction } from "@/lib/prisma";
import { createOssClient } from "../providers/createClient";
export async function deleteStorageObject({ userId, id }: { userId: string; id: string }) {
  return withTransaction(async (tx) => {
    const object = await tx.ossObject.findUnique({
      where: { id, userId },
      include: { bucket: true },
    });
    if (!object || !object.bucket) {
      throw new Error("Object not found");
    }
    const ossClient = await createOssClient(object.bucket);
    await ossClient.deleteObject(object.key);
    await deleteOssObject({ id, userId }, tx);
  });
}
