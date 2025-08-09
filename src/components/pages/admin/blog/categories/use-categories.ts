import { createNewCategory, getCategories } from "@/actions/admin/blog/categories/categories";
import { deleteCategoryAction, updateCategoryAction } from "@/actions/admin/blog/categories/item";
import { type Locale } from "@/i18n/locales";
import { CategoryWithTranslations } from "@/types/blog";
import { PaginatedResponse } from "@/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CategoryTranslation {
  locale: Locale;
  name: string;
}

interface CategoryData {
  slug: string;
  translations: CategoryTranslation[];
}

interface CategoriesParams {
  page?: number;
  pageSize?: number;
  search?: {
    slug?: string;
    name?: string;
  };
}

async function fetchCategories({
  page = 1,
  pageSize = 10,
  search = {},
}: CategoriesParams = {}): Promise<PaginatedResponse<CategoryWithTranslations>> {
  const response = await getCategories({
    page,
    pageSize,
    searchSlug: search.slug,
    searchName: search.name,
  });
  return {
    ...response,
    total: response.totalCount,
    page,
    pageSize,
  };
}

async function fetchAllCategories(): Promise<CategoryWithTranslations[]> {
  const response = await getCategories({ pageSize: 1000 });
  return response.items;
}

export function useCategories(params: CategoriesParams = {}) {
  return useQuery({
    queryKey: ["blog-categories", params],
    queryFn: () => fetchCategories(params),
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: ["blog-categories-all"],
    queryFn: fetchAllCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: CategoryData & { id: string }) =>
      updateCategoryAction({
        where: { id },
        data: {
          slug: data.slug,
          translations: {
            deleteMany: {},
            create: data.translations,
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    },
  });
}
