"use server";

import { getExploreItems } from "@/db/explore/items";
import { ExploreItemStatus } from "@/db/generated/prisma";

interface GetPublicExploreItemsParams {
  page?: number;
  pageSize?: number;
  type?: string; // 'image' | 'video' | 'all'
  featured?: boolean;
  orderBy?: 'createdAt' | 'featured';
}

export async function getPublicExploreItemsAction(params: GetPublicExploreItemsParams = {}) {
  try {
    const {
      page = 1,
      pageSize = 20,
      type,
      featured,
      orderBy = 'createdAt'
    } = params;

    const orderByOptions = {
      createdAt: orderBy === 'createdAt' ? 'desc' as const : undefined,
      featured: orderBy === 'featured' ? 'desc' as const : undefined,
    };

    const items = await getExploreItems({
      status: ExploreItemStatus.APPROVED,
      isVisible: true,
      type: type && type !== 'all' ? type : undefined,
      featured: featured,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy: orderByOptions,
    });

    return items;
  } catch (error) {
    console.error("Error fetching public explore items:", error);
    throw new Error("Failed to fetch explore items");
  }
}