import {
  batchUpdateExploreItemStatusAction,
  deleteExploreItemAction,
  getExploreItemsForAdminAction,
  updateExploreItemFeaturedAction,
  updateExploreItemStatusAction,
} from "@/actions/admin/explore";
import { ExploreItem, ExploreItemStatus } from "@/db/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseExploreItemsParams {
  statusFilter: ExploreItemStatus | "ALL";
  typeFilter: string;
  visibilityFilter: string;
  featuredFilter: string;
  page: number;
  pageSize: number;
}

export function useExploreItems(params: UseExploreItemsParams) {
  const { statusFilter, typeFilter, visibilityFilter, featuredFilter, page, pageSize } = params;
  
  const filters: Record<string, unknown> = {};
  
  if (statusFilter !== "ALL") {
    filters.status = statusFilter;
  }
  
  if (typeFilter !== "ALL") {
    filters.type = typeFilter;
  }
  
  if (visibilityFilter !== "ALL") {
    filters.isVisible = visibilityFilter === "true";
  }
  
  if (featuredFilter !== "ALL") {
    filters.featured = featuredFilter === "true";
  }

  return useQuery<ExploreItem[]>({
    queryKey: ["explore-items", statusFilter, typeFilter, visibilityFilter, featuredFilter, page, pageSize],
    queryFn: () => getExploreItemsForAdminAction({
      page,
      pageSize,
      ...filters,
    }),
  });
}

export function useUpdateExploreItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, isVisible }: { id: string; status: ExploreItemStatus; isVisible?: boolean }) =>
      updateExploreItemStatusAction(id, status, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore-items"] });
    },
  });
}

export function useUpdateExploreItemFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      updateExploreItemFeaturedAction(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore-items"] });
    },
  });
}

export function useDeleteExploreItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExploreItemAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore-items"] });
    },
  });
}

export function useBatchUpdateExploreItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status, isVisible }: { ids: string[]; status: ExploreItemStatus; isVisible?: boolean }) =>
      batchUpdateExploreItemStatusAction(ids, status, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore-items"] });
    },
  });
}