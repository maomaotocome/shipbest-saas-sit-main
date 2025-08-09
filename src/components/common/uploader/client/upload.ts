import { JsonObject } from "@/types/json";
import { GetPresignedPutUrlResult } from "@/types/oss";
import { getPresignedUrl } from "./get-presigned-url";
import { updateUploadStatus } from "./update-status";
async function uploadWithProgress(
  file: File,
  presignedData: GetPresignedPutUrlResult,
  onProgress: (progress: number) => void
): Promise<GetPresignedPutUrlResult> {
  if (presignedData.status === "failure") {
    throw new Error(presignedData.message);
  }
  if (!presignedData.data.putUrl) {
    throw new Error("Upload failed");
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        await updateUploadStatus(presignedData.data.id);
        resolve(presignedData);
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.open("PUT", presignedData.data.putUrl || "", true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.send(file);
  });
}

async function uploadWithoutProgress(
  file: File,
  presignedData: GetPresignedPutUrlResult
): Promise<GetPresignedPutUrlResult> {
  if (presignedData.status === "failure") {
    throw new Error(presignedData.message);
  }
  const uploadResponse = await fetch(presignedData.data.putUrl || "", {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload failed");
  }

  await updateUploadStatus(presignedData.data.id);
  return presignedData;
}

export async function uploadFile({
  file,
  isPublic = true,
  metadata,
  onProgress,
}: {
  file: File;
  isPublic?: boolean;
  metadata?: JsonObject;
  onProgress?: (progress: number) => void;
}): Promise<GetPresignedPutUrlResult> {
  try {
    const presignedData = await getPresignedUrl({ file, isPublic, metadata });
    return onProgress
      ? uploadWithProgress(file, presignedData, onProgress)
      : uploadWithoutProgress(file, presignedData);
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
