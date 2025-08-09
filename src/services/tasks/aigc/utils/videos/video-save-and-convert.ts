import { OssObject } from "@/db/generated/prisma";
import { StorageObjectSource } from "@/lib/constants";
import { uploadStorageObject } from "@/services/oss/objects/upload";
import { JsonObject } from "@/types/json";
import { v4 as uuidv4 } from "uuid";

export interface VideoSaveResult {
  originalObject: OssObject;
  fileSize: number;
}

export interface VideoSaveParams {
  videoUrl: string;
  fileName: string;
  type: "video/mp4" | "video/webm" | "video/avi";
  userId?: string;
  isPublic: boolean;
  taskInfo: {
    taskId: string;
    subTaskId: string;
  };
}

// Helper function to upload buffer by creating File object
async function uploadBuffer({
  buffer,
  fileName,
  contentType,
  userId,
  isPublic,
  metadata,
}: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  userId?: string;
  isPublic: boolean;
  metadata: JsonObject;
}): Promise<OssObject> {
  // Create File object from Buffer
  const file = new File([buffer], fileName, { type: contentType });

  try {
    return await uploadStorageObject({
      fileInfo: {
        filename: fileName,
        type: contentType,
        size: buffer.length,
        isPublic,
        file,
        metadata,
      },
      userId,
    });
  } catch (error) {
    console.error("Upload object failed", error);
    throw error;
  }
}

export async function videoSave(params: VideoSaveParams): Promise<VideoSaveResult> {
  const { videoUrl, fileName, type, userId, isPublic, taskInfo } = params;

  try {
    // Download the video
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBuffer = Buffer.from(await response.arrayBuffer());

    // Calculate file size
    const fileSize = videoBuffer.length;

    // Generate unique file name
    const originalFileName = `${uuidv4()}_original_${fileName}`;

    // create video metadata
    const videoMetadata = {
      source: StorageObjectSource.USER_GENERATED,
      taskInfo,
      isOriginal: true,
      isProcessed: false,
      originalFormat: type,
      isConverted: false,
    };

    // Upload original video
    const originalObject = await uploadBuffer({
      buffer: videoBuffer,
      fileName: originalFileName,
      contentType: type,
      userId,
      isPublic,
      metadata: videoMetadata as unknown as JsonObject,
    });

    return {
      originalObject,
      fileSize,
    };
  } catch (error) {
    console.error("Error in videoSave:", error);
    throw error;
  }
}

// Note: video metadata extraction removed per current requirements.
