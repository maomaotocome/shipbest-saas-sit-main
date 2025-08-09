import { Prisma } from "@/db/generated/prisma";
import { createOssObject, getOneAvailableOssBucket } from "@/db/oss";
import { getMaxFileSize, isSupportedFileType } from "@/lib/config/upload";
import { withTransaction } from "@/lib/prisma";
import { FileUploadInfo, GetPresignedPutUrlResult } from "@/types/oss";
import { createOssClient } from "../providers/createClient";
import { generateFileKey } from "../utils";
export async function getUploadInfo({
  userId,
  fileInfo,
}: {
  userId?: string;
  fileInfo: FileUploadInfo;
}): Promise<GetPresignedPutUrlResult> {
  // validate file type
  if (!isSupportedFileType(fileInfo.type)) {
    return {
      status: "failure",
      message: `Unsupported file type: ${fileInfo.type}`,
    };
  }

  // validate file size
  const maxFileSize = getMaxFileSize(fileInfo.type);
  if (fileInfo.size > maxFileSize) {
    return {
      status: "failure",
      message: `File size ${fileInfo.size} bytes exceeds maximum allowed size ${maxFileSize} bytes`,
    };
  }

  const fileKey = generateFileKey({
    filename: fileInfo.filename,
    prefix: userId || "temp",
  });
  return withTransaction(async (tx) => {
    const bucket = await getOneAvailableOssBucket({ isPublic: fileInfo.isPublic }, tx);
    if (!bucket) {
      throw new Error("No available bucket");
    }
    const isPublic = bucket.isPublic as boolean;
    const ossClient = await createOssClient(bucket);
    const putUrl = await ossClient.getSignedPutUrl(fileKey);
    const url = isPublic
      ? await ossClient.getPublicUrl(fileKey)
      : await ossClient.getSignedGetUrl(fileKey);
    const object = await createOssObject(
      {
        bucket: { connect: { id: bucket.id } },
        key: fileKey,
        size: fileInfo.size,
        type: fileInfo.type,
        isPublic: bucket.isPublic,
        originName: fileInfo.filename,
        ...(isPublic ? { publicUrl: url } : {}),
        ...(userId ? { user: { connect: { id: userId } } } : {}),
        metadata: fileInfo.metadata as Prisma.InputJsonValue,
        uploaded: false,
      },
      tx
    );

    return {
      status: "success",
      data: { ...object, putUrl, url },
    } as GetPresignedPutUrlResult;
  });
}
