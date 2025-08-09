import { prisma } from "@/lib/prisma";
import { ExploreItem, ExploreItemStatus, Prisma } from "../generated/prisma";

// Create explore item
export async function createExploreItem(data: Prisma.ExploreItemCreateInput): Promise<ExploreItem> {
  return prisma.exploreItem.create({
    data,
    include: {
      task: true,
      subTask: true,
    },
  });
}

// Get explore items list (for frontend display)
export async function getExploreItems(options: {
  status?: ExploreItemStatus;
  isVisible?: boolean;
  featured?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
  orderBy?: Prisma.ExploreItemOrderByWithRelationInput;
}): Promise<ExploreItem[]> {
  const {
    status = ExploreItemStatus.APPROVED,
    isVisible = true,
    featured,
    type,
    limit = 20,
    offset = 0,
    orderBy = { createdAt: "desc" },
  } = options;

  const where: Prisma.ExploreItemWhereInput = {
    status,
    isVisible,
    ...(featured !== undefined && { featured }),
    ...(type && { type }),
  };

  return prisma.exploreItem.findMany({
    where,
    orderBy,
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

// Get single explore item details
export async function getExploreItem(id: string): Promise<ExploreItem | null> {
  return prisma.exploreItem.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

// Alias for getExploreItem for consistent naming
export const getExploreItemById = getExploreItem;

// Admin get explore items list (including all statuses)
export async function getExploreItemsForAdmin(options: {
  status?: ExploreItemStatus;
  isVisible?: boolean;
  featured?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
  orderBy?: Prisma.ExploreItemOrderByWithRelationInput;
}): Promise<ExploreItem[]> {
  const {
    status,
    isVisible,
    featured,
    type,
    limit = 20,
    offset = 0,
    orderBy = { createdAt: "desc" },
  } = options;

  const where: Prisma.ExploreItemWhereInput = {
    ...(status !== undefined && { status }),
    ...(isVisible !== undefined && { isVisible }),
    ...(featured !== undefined && { featured }),
    ...(type && { type }),
  };

  return prisma.exploreItem.findMany({
    where,
    orderBy,
    take: limit,
    skip: offset,
    include: {
      task: {
        select: {
          id: true,
          taskType: true,
          metadata: true,
          request: true,
          createdAt: true,
          userId: true,
        },
      },
      subTask: {
        select: {
          id: true,
          response: true,
        },
      },
    },
  });
}

// Update explore item status
export async function updateExploreItemStatus(
  id: string,
  status: ExploreItemStatus,
  isVisible?: boolean
): Promise<ExploreItem> {
  return prisma.exploreItem.update({
    where: { id },
    data: {
      status,
      ...(isVisible !== undefined && { isVisible }),
    },
  });
}

// Update explore item featured status
export async function updateExploreItemFeatured(
  id: string,
  featured: boolean
): Promise<ExploreItem> {
  return prisma.exploreItem.update({
    where: { id },
    data: { featured },
  });
}

// Batch update explore item status
export async function batchUpdateExploreItemStatus(
  ids: string[],
  status: ExploreItemStatus,
  isVisible?: boolean
): Promise<Prisma.BatchPayload> {
  return prisma.exploreItem.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      status,
      ...(isVisible !== undefined && { isVisible }),
    },
  });
}

// Delete explore item
export async function deleteExploreItem(id: string): Promise<ExploreItem> {
  return prisma.exploreItem.delete({
    where: { id },
  });
}

// Check if explore item exists
export async function checkExploreItemExists(
  taskId: string,
  subTaskId: string,
  objectId: string
): Promise<boolean> {
  const count = await prisma.exploreItem.count({
    where: {
      taskId,
      subTaskId,
      objectId,
    },
  });
  return count > 0;
}

// Get explore item statistics
export async function getExploreItemStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  visible: number;
  featured: number;
}> {
  const [total, pending, approved, rejected, hidden, visible, featured] = await Promise.all([
    prisma.exploreItem.count(),
    prisma.exploreItem.count({ where: { status: ExploreItemStatus.PENDING } }),
    prisma.exploreItem.count({ where: { status: ExploreItemStatus.APPROVED } }),
    prisma.exploreItem.count({ where: { status: ExploreItemStatus.REJECTED } }),
    prisma.exploreItem.count({ where: { status: ExploreItemStatus.HIDDEN } }),
    prisma.exploreItem.count({ where: { isVisible: true } }),
    prisma.exploreItem.count({ where: { featured: true } }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
    hidden,
    visible,
    featured,
  };
}

// Get explore items by task ID
export async function getExploreItemsByTaskId(taskId: string): Promise<ExploreItem[]> {
  return prisma.exploreItem.findMany({
    where: { taskId },
    include: {
      task: true,
      subTask: true,
    },
  });
}

// Get explore items by sub-task ID
export async function getExploreItemsBySubTaskId(subTaskId: string): Promise<ExploreItem[]> {
  return prisma.exploreItem.findMany({
    where: { subTaskId },
    include: {
      task: true,
      subTask: true,
    },
  });
}
