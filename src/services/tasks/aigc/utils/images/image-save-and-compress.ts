"use server";

import { StorageObjectSource } from "@/lib/constants";
import { calculateRatio } from "@/lib/types/media-metadata";
import { uploadStorageObject } from "@/services/oss/objects/upload";
import { JsonObject } from "@/types/json";
import sharp from "sharp";

type ImageType = "image/png" | "image/jpg" | "image/jpeg" | "image/webp";

// calculateRatio function is now imported from media-metadata.ts

export async function imageSaveAndCompressAndGetInfo({
  imageUrl,
  fileName,
  type,
  userId,
  isPublic = false,
  taskInfo,
}: {
  imageUrl: string;
  fileName: string;
  type: ImageType;
  userId?: string;
  isPublic?: boolean;
  taskInfo?: {
    taskId: string;
    subTaskId: string;
  };
}) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const file = new File([blob], `${fileName || imageUrl.split("/").pop()}.${type}`, { type });

  const imageInfo = await getImageInfo(file);

  const dimensions =
    imageInfo.width && imageInfo.height
      ? {
          width: imageInfo.width,
          height: imageInfo.height,
        }
      : undefined;

  const ratio = dimensions ? calculateRatio(dimensions.width, dimensions.height) : undefined;

  // create original metadata
  const originalMetadata = {
    source: StorageObjectSource.USER_GENERATED,
    taskInfo,
    isOriginal: true,
    isProcessed: false,
    originalUrl: imageUrl,
    originalFormat: type,
    dimensions,
    ratio,
    isCompressed: false,
  };

  const originalObject = await uploadStorageObject({
    fileInfo: {
      filename: fileName,
      type: type,
      size: file.size,
      isPublic,
      file,
      metadata: originalMetadata as unknown as JsonObject,
    },
    userId,
  });

  const compressedFile = await compressImageAsAvif(file);
  const compressedFileName = `${fileName.split(".")[0]}.avif`;

  // create compressed metadata
  const compressedMetadata = {
    source: StorageObjectSource.USER_GENERATED,
    taskInfo,
    isOriginal: false,
    isProcessed: true,
    originalFormat: type,
    dimensions,
    ratio,
    isCompressed: true,
    compressionQuality: 40,
    uncompressedObjectId: originalObject.id,
    originalObjectId: originalObject.id,
  };

  const compressedObject = await uploadStorageObject({
    fileInfo: {
      filename: compressedFileName,
      type: compressedFile.type,
      size: compressedFile.size,
      isPublic,
      file: compressedFile,
      metadata: compressedMetadata as unknown as JsonObject,
    },
    userId,
  });

  return {
    originalObject,
    compressedObject,
    imageInfo,
  };
}

async function compressImageAsAvif(file: File) {
  return new File(
    [
      await sharp(await file.arrayBuffer())
        .avif({ quality: 40 })
        .toBuffer(),
    ],
    `${file.name}.avif`,
    {
      type: "image/avif",
    }
  );
}

async function getImageInfo(file: File) {
  const imageInfo = await sharp(await file.arrayBuffer()).metadata();
  return imageInfo;
}
