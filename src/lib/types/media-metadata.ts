import { StorageObjectSource } from "@/lib/constants";

/**
 * 任务信息接口
 */
export interface TaskInfo {
  taskId: string;
  subTaskId: string;
}

/**
 * 媒体文件的基础元数据接口
 */
export interface BaseMediaMetadata {
  // 来源标识
  source: StorageObjectSource;
  
  // 任务信息 (如果是AI生成的内容)
  taskInfo?: TaskInfo;
  
  // 文件处理状态
  isOriginal: boolean;
  isProcessed: boolean;
  
  // 原始信息
  originalUrl?: string;
  originalFormat?: string;
  
  // 关联对象ID
  originalObjectId?: string;
  processedObjectId?: string;
}

/**
 * 图片文件的元数据接口
 */
export interface ImageMetadata extends BaseMediaMetadata {
  // 图片尺寸信息
  dimensions?: {
    width: number;
    height: number;
  };
  
  // 宽高比
  ratio?: {
    w: number;
    h: number;
  };
  
  // 图片处理相关
  isCompressed?: boolean;
  compressionQuality?: number;
  uncompressedObjectId?: string;
}

/**
 * 视频文件的元数据接口
 */
export interface VideoMetadata extends BaseMediaMetadata {
  // 视频尺寸信息
  dimensions?: {
    width: number;
    height: number;
  };
  
  // 宽高比
  ratio?: {
    w: number;
    h: number;
  };
  
  // 视频特有信息
  duration?: number;
  framerate?: number;
  bitrate?: number;
  
  // 视频处理相关
  isConverted?: boolean;
  convertedFormat?: string;
  unconvertedObjectId?: string;
}

/**
 * 音频文件的元数据接口
 */
export interface AudioMetadata extends BaseMediaMetadata {
  // 音频信息
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  
  // 音频处理相关
  isConverted?: boolean;
  convertedFormat?: string;
  unconvertedObjectId?: string;
}

/**
 * 文档文件的元数据接口
 */
export interface DocumentMetadata extends BaseMediaMetadata {
  // 文档信息
  pageCount?: number;
  
  // 文档处理相关
  isConverted?: boolean;
  convertedFormat?: string;
}

/**
 * 通用媒体元数据类型
 */
export type MediaMetadata = ImageMetadata | VideoMetadata | AudioMetadata | DocumentMetadata;

/**
 * 媒体类型枚举
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other'
}

/**
 * 根据 MIME 类型获取媒体类型
 */
export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
  if (mimeType.startsWith('application/pdf') || 
      mimeType.startsWith('text/') || 
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint')) return MediaType.DOCUMENT;
  return MediaType.OTHER;
}

/**
 * 计算宽高比的工具函数
 */
export function calculateRatio(width: number, height: number): { w: number; h: number } {
  if (width === 0 || height === 0) {
    return { w: 1, h: 1 };
  }
  
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  
  return {
    w: width / divisor,
    h: height / divisor
  };
}

/**
 * 创建基础元数据的工具函数
 */
export function createBaseMetadata({
  source,
  taskInfo,
  isOriginal = true,
  isProcessed = false,
  originalUrl,
  originalFormat,
}: {
  source: StorageObjectSource;
  taskInfo?: TaskInfo;
  isOriginal?: boolean;
  isProcessed?: boolean;
  originalUrl?: string;
  originalFormat?: string;
}): BaseMediaMetadata {
  return {
    source,
    taskInfo,
    isOriginal,
    isProcessed,
    originalUrl,
    originalFormat,
  };
}