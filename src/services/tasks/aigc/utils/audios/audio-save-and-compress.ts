"use server";

import { OssObject } from "@/db/generated/prisma";
import { StorageObjectSource } from "@/lib/constants";
import { uploadStorageObject } from "@/services/oss/objects/upload";
import { JsonObject } from "@/types/json";
import { v4 as uuidv4 } from "uuid";

export interface AudioSaveResult {
  originalObject: OssObject;
  fileSize: number;
}

export interface AudioSaveParams {
  audioUrl: string;
  fileName: string;
  type: "audio/mp3" | "audio/mpeg" | "audio/wav" | "audio/ogg";
  userId?: string;
  isPublic: boolean;
  taskInfo: {
    taskId: string;
    subTaskId: string;
  };
  duration?: number;
  title?: string;
  tags?: string;
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

export async function audioSave(params: AudioSaveParams): Promise<AudioSaveResult> {
  const { audioUrl, fileName, type, userId, isPublic, taskInfo, duration, title, tags } = params;

  try {
    // Download the audio
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Calculate file size
    const fileSize = audioBuffer.length;

    // Generate unique file name
    const originalFileName = `${uuidv4()}_original_${fileName}`;

    // create audio metadata
    const audioMetadata = {
      source: StorageObjectSource.USER_GENERATED,
      taskInfo,
      isOriginal: true,
      isProcessed: false,
      originalFormat: type,
      duration,
      title,
      tags,
    };

    // Upload original audio
    const originalObject = await uploadBuffer({
      buffer: audioBuffer,
      fileName: originalFileName,
      contentType: type,
      userId,
      isPublic,
      metadata: audioMetadata as unknown as JsonObject,
    });

    return {
      originalObject,
      fileSize,
    };
  } catch (error) {
    console.error("Error in audioSave:", error);
    throw error;
  }
}