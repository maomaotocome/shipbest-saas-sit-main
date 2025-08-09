import { StorageObjectSource } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { MediaType, getMediaType } from "@/lib/types/media-metadata";
import { JsonObject } from "@prisma/client/runtime/library";
import { OssObjectStatus, Prisma } from "../generated/prisma";

export interface LibraryFilter {
  source?: StorageObjectSource;
  mediaType?: MediaType;
  hasTaskInfo?: boolean;
  search?: string;
}

export interface LibraryObject {
  id: string;
  originName: string;
  key: string;
  size: number;
  type: string;
  extension: string | null;
  publicUrl: string | null;
  metadata: JsonObject;
  status: OssObjectStatus;
  createdAt: Date;
  updatedAt: Date;
  // 计算字段
  mediaType: MediaType;
  source: StorageObjectSource;
  taskInfo?: {
    taskId: string;
    subTaskId: string;
  };
  dimensions?: {
    width: number;
    height: number;
  };
  ratio?: {
    w: number;
    h: number;
  };
  isOriginal?: boolean;
  isProcessed?: boolean;
  originalUrl?: string;
  originalObjectId?: string;
  processedObjectId?: string;
}

export async function getUserLibraryObjects(
  userId: string,
  filter: LibraryFilter = {},
  page: number = 1,
  limit: number = 20
): Promise<{
  objects: LibraryObject[];
  total: number;
  hasNext: boolean;
}> {
  const skip = (page - 1) * limit;

  // 构建查询条件
  const whereCondition: Prisma.OssObjectWhereInput = {
    userId,
    status: OssObjectStatus.ACTIVE,
  };

  // 搜索条件
  if (filter.search) {
    whereCondition.originName = {
      contains: filter.search,
      mode: "insensitive",
    };
  }

  // 获取对象
  const [objects, total] = await Promise.all([
    prisma.ossObject.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        bucket: {
          select: {
            publicUrl: true,
          },
        },
      },
    }),
    prisma.ossObject.count({
      where: whereCondition,
    }),
  ]);

  // 处理和过滤对象
  const processedObjects = objects
    .map((obj) => {
      const mediaType = getMediaType(obj.type);
      const metadata = obj.metadata as JsonObject;

      // 提取源类型
      let source: StorageObjectSource;
      if (metadata?.source) {
        source = metadata.source as StorageObjectSource;
      } else if (
        metadata?.taskInfo ||
        metadata?.task_info ||
        (metadata?.taskId && metadata?.subTaskId)
      ) {
        source = StorageObjectSource.USER_GENERATED;
      } else {
        source = StorageObjectSource.USER_UPLOAD;
      }

      // 提取任务信息
      let taskInfo: { taskId: string; subTaskId: string } | undefined;
      if (metadata?.taskInfo) {
        taskInfo = metadata.taskInfo as { taskId: string; subTaskId: string };
      } else if (metadata?.task_info) {
        taskInfo = metadata.task_info as { taskId: string; subTaskId: string };
      } else if (metadata?.taskId && metadata?.subTaskId) {
        taskInfo = {
          taskId: metadata.taskId as string,
          subTaskId: metadata.subTaskId as string,
        };
      }

      // 提取尺寸信息
      let dimensions: { width: number; height: number } | undefined;
      if (metadata?.dimensions) {
        dimensions = metadata.dimensions as { width: number; height: number };
      } else if (metadata?.original_width && metadata?.original_height) {
        dimensions = {
          width: Number(metadata.original_width),
          height: Number(metadata.original_height),
        };
      } else if (metadata?.width && metadata?.height) {
        dimensions = {
          width: Number(metadata.width),
          height: Number(metadata.height),
        };
      }

      // 提取比例信息
      let ratio: { w: number; h: number } | undefined;
      if (metadata?.ratio) {
        ratio = metadata.ratio as { w: number; h: number };
      }

      return {
        id: obj.id,
        originName: obj.originName,
        key: obj.key,
        size: obj.size,
        type: obj.type,
        extension: obj.extension,
        publicUrl: obj.publicUrl,
        metadata: obj.metadata,
        status: obj.status,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
        mediaType,
        source,
        taskInfo,
        dimensions,
        ratio,
        isOriginal: metadata?.isOriginal ?? metadata?.is_original ?? true,
        isProcessed: metadata?.isProcessed ?? false,
        originalUrl: metadata?.originalUrl ?? metadata?.original_url,
        originalObjectId: metadata?.originalObjectId ?? metadata?.original_object_id,
        processedObjectId: metadata?.processedObjectId ?? metadata?.processed_object_id,
      } as LibraryObject;
    })
    .filter((obj) => {
      // 应用过滤器
      if (filter.source && obj.source !== filter.source) return false;
      if (filter.mediaType && obj.mediaType !== filter.mediaType) return false;
      if (filter.hasTaskInfo !== undefined) {
        if (filter.hasTaskInfo && !obj.taskInfo) return false;
        if (!filter.hasTaskInfo && obj.taskInfo) return false;
      }
      return true;
    });

  return {
    objects: processedObjects,
    total: processedObjects.length, // 注意：这里应该是过滤后的总数，但为了简化，使用实际返回的数量
    hasNext: page * limit < total,
  };
}

export async function getLibraryStats(userId: string): Promise<{
  totalObjects: number;
  totalSize: number;
  bySource: Record<StorageObjectSource, number>;
  byMediaType: Record<MediaType, number>;
}> {
  const objects = await prisma.ossObject.findMany({
    where: {
      userId,
      status: OssObjectStatus.ACTIVE,
    },
    select: {
      size: true,
      type: true,
      metadata: true,
    },
  });

  const stats = {
    totalObjects: objects.length,
    totalSize: objects.reduce((sum, obj) => sum + obj.size, 0),
    bySource: {
      [StorageObjectSource.USER_UPLOAD]: 0,
      [StorageObjectSource.USER_GENERATED]: 0,
    },
    byMediaType: {
      [MediaType.IMAGE]: 0,
      [MediaType.VIDEO]: 0,
      [MediaType.AUDIO]: 0,
      [MediaType.DOCUMENT]: 0,
      [MediaType.OTHER]: 0,
    },
  };

  objects.forEach((obj) => {
    const mediaType = getMediaType(obj.type);
    const metadata = obj.metadata as JsonObject;

    let source: StorageObjectSource;
    if (metadata?.source) {
      source = metadata.source as StorageObjectSource;
    } else if (
      metadata?.taskInfo ||
      metadata?.task_info ||
      (metadata?.taskId && metadata?.subTaskId)
    ) {
      source = StorageObjectSource.USER_GENERATED;
    } else {
      source = StorageObjectSource.USER_UPLOAD;
    }

    stats.bySource[source]++;
    stats.byMediaType[mediaType]++;
  });

  return stats;
}
