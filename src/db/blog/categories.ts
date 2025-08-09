import { Prisma } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";

interface GetAllCategoriesParams {
  page?: number;
  pageSize?: number;
  searchSlug?: string;
  searchName?: string;
}

export async function getAllCategories({
  page,
  pageSize,
  searchSlug = "",
  searchName = "",
}: GetAllCategoriesParams = {}) {
  const where = {
    AND: [
      searchSlug ? { slug: { contains: searchSlug } } : {},
      searchName
        ? {
            translations: {
              some: {
                name: { contains: searchName },
              },
            },
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.blogCategory.findMany({
      where,
      include: {
        translations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(page && pageSize ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
    }),
    prisma.blogCategory.count({ where }),
  ]);

  return {
    items,
    total,
  };
}

export async function getCategory(id: string) {
  return prisma.blogCategory.findUnique({
    where: { id },
    include: { translations: true },
  });
}

export async function createCategory(data: Prisma.BlogCategoryCreateArgs) {
  return prisma.blogCategory.create(data);
}

export async function updateCategory(data: Prisma.BlogCategoryUpdateArgs) {
  return prisma.blogCategory.update(data);
}

export async function deleteCategory(id: string) {
  return prisma.blogCategory.delete({
    where: { id },
  });
}

export async function checkSlugExists(slug: string, excludeId?: string) {
  const category = await prisma.blogCategory.findUnique({
    where: {
      slug,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
  });
  return !!category;
}
