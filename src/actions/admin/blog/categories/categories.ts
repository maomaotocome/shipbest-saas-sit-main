"use server";

import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
export async function getCategories(params: {
  page?: number;
  pageSize?: number;
  searchSlug?: string;
  searchName?: string;
}) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const { page = 1, pageSize = 5, searchSlug = "", searchName = "" } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.BlogCategoryWhereInput = {
      ...(searchSlug && { slug: { contains: searchSlug, mode: "insensitive" } }),
      ...(searchName && {
        translations: {
          some: { name: { contains: searchName, mode: "insensitive" } },
        },
      }),
    };

    const [categories, totalCount] = await Promise.all([
      prisma.blogCategory.findMany({
        where,
        include: {
          translations: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.blogCategory.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      items: categories,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error("[BLOG_CATEGORIES_GET]", error);
    throw new Error("Internal Error");
  }
}

export async function createNewCategory(data: Prisma.BlogCategoryCreateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return prisma.blogCategory.create(data);
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}
