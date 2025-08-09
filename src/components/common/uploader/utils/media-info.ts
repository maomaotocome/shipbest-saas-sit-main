import { StorageObjectSource } from "@/lib/constants";

export interface MediaDimensions {
  width: number;
  height: number;
}

export interface MediaMetadata {
  source: StorageObjectSource;
  ratio?: {
    w: number;
    h: number;
  };
  size?: {
    w: number;
    h: number;
  };
}

/**
 * 获取图片尺寸信息
 */
export function getImageDimensions(file: File): Promise<MediaDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 获取视频尺寸信息
 */
export function getVideoDimensions(file: File): Promise<MediaDimensions> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      reject(new Error("Failed to load video"));
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  });
}

/**
 * 计算宽高比
 */
function calculateRatio(width: number, height: number): { w: number; h: number } {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const divisor = gcd(width, height);
  return {
    w: width / divisor,
    h: height / divisor,
  };
}

/**
 * 根据文件类型获取媒体元数据
 */
export async function getMediaMetadata(file: File): Promise<MediaMetadata> {
  const baseMetadata: MediaMetadata = {
    source: StorageObjectSource.USER_UPLOAD,
  };

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (isImage) {
    try {
      const dimensions = await getImageDimensions(file);
      baseMetadata.ratio = calculateRatio(dimensions.width, dimensions.height);
      baseMetadata.size = {
        w: dimensions.width,
        h: dimensions.height,
      };
    } catch (error) {
      console.warn("Failed to get image dimensions:", error);
    }
  } else if (isVideo) {
    try {
      const dimensions = await getVideoDimensions(file);
      baseMetadata.ratio = calculateRatio(dimensions.width, dimensions.height);
      baseMetadata.size = {
        w: dimensions.width,
        h: dimensions.height,
      };
    } catch (error) {
      console.warn("Failed to get video dimensions:", error);
    }
  }

  return baseMetadata;
}