import { Prisma } from "@/db/generated/prisma";
import { createOssObject, getOneAvailableOssBucket } from "@/db/oss";
import { FileUploadInfo } from "@/types/oss";
import { createOssClient } from "../providers/createClient";
import { generateFileKey } from "../utils";
export async function uploadStorageObject({
  fileInfo,
  userId,
}: {
  fileInfo: FileUploadInfo;
  userId?: string;
}) {
  if (!fileInfo.file) {
    throw new Error("File is required");
  }
  const bucket = await getOneAvailableOssBucket({ isPublic: fileInfo.isPublic });
  if (!bucket) {
    throw new Error("No available bucket");
  }
  const ossClient = createOssClient(bucket);
  const key = generateFileKey({
    filename: fileInfo.filename,
    prefix: userId || "temp",
  });
  try {
    await ossClient.uploadObject(key, fileInfo.file);
    return await createOssObject({
      bucket: { connect: { id: bucket.id } },
      key,
      size: fileInfo.size,
      type: fileInfo.type,
      isPublic: bucket.isPublic,
      ...(bucket.isPublic ? { publicUrl: await ossClient.getPublicUrl(key) } : {}),
      hash: fileInfo.hash,
      originName: fileInfo.filename,
      ...(userId ? { user: { connect: { id: userId } } } : {}),
      metadata: fileInfo.metadata as Prisma.InputJsonValue,
      uploaded: true,
    });
  } catch (error) {
    console.error("Upload object failed", error);
    throw error;
  }
}
