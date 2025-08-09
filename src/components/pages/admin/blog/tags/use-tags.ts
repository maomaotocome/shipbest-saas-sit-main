import { deleteTagAction, updateTagAction } from "@/actions/admin/blog/tags/item";
import { createNewTagAction, getTagsListAction } from "@/actions/admin/blog/tags/tags";
import { Prisma } from "@/db/generated/prisma";
import { TagWithTranslations } from "@/types/blog";
import { PaginatedResponse } from "@/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface TagsParams {
  page?: number;
  pageSize?: number;
  searchSlug?: string;
  searchName?: string;
}

async function fetchTags({
  page = 1,
  pageSize = 10,
  searchSlug = "",
  searchName = "",
}: TagsParams = {}): Promise<PaginatedResponse<TagWithTranslations>> {
  return getTagsListAction({
    page,
    pageSize,
    searchSlug,
    searchName,
  });
}

async function fetchAllTags(): Promise<TagWithTranslations[]> {
  const response = await getTagsListAction({ page: 1, pageSize: 1000 });
  return response.items;
}

export function useTags(params: TagsParams = {}) {
  return useQuery({
    queryKey: ["blog-tags", params],
    queryFn: () => fetchTags(params),
  });
}

export function useAllTags() {
  return useQuery({
    queryKey: ["blog-tags-all"],
    queryFn: fetchAllTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewTagAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Prisma.BlogTagUpdateInput & { id: string }) =>
      updateTagAction({
        where: { id },
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTagAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
    },
  });
}
