"use client";

import { getPublicExploreItemsAction } from "@/actions/explore/items";
import { ExploreItem } from "@/db/generated/prisma";
import { useQuery } from "@tanstack/react-query";

interface UseExploreParams {
  type?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'featured';
}

export function useExplore(params: UseExploreParams = {}) {
  const { type = 'all', featured, page = 1, pageSize = 20, orderBy = 'createdAt' } = params;

  return useQuery<ExploreItem[]>({
    queryKey: ['explore-items', type, featured, page, pageSize, orderBy],
    queryFn: () => getPublicExploreItemsAction({
      type,
      featured,
      page,
      pageSize,
      orderBy,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}