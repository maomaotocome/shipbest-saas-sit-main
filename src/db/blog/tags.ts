import { Prisma } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { TagWithTranslations } from "@/types/blog";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

interface GetAllTagsParams extends PaginationParams {
  searchSlug?: string;
  searchName?: string;
}

export async function getAllTags({
  page,
  pageSize,
  searchSlug = "",
  searchName = "",
}: GetAllTagsParams): Promise<PaginatedResponse<TagWithTranslations>> {
  const where: Prisma.BlogTagWhereInput = {
    AND: [],
  };

  if (searchSlug) {
    (where.AND as Prisma.BlogTagWhereInput[]).push({
      slug: { contains: searchSlug, mode: Prisma.QueryMode.insensitive },
    });
  }
  if (searchName) {
    (where.AND as Prisma.BlogTagWhereInput[]).push({
      translations: {
        some: {
          name: { contains: searchName, mode: Prisma.QueryMode.insensitive },
        },
      },
    });
  }

  if ((where.AND as Prisma.BlogTagWhereInput[]).length === 0) {
    delete where.AND;
  }

  const prismaArgs: Omit<Prisma.BlogTagFindManyArgs, "skip" | "take"> = {
    where,
    include: {
      translations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  return paginatePrismaQuery<
    TagWithTranslations,
    Prisma.BlogTagCountArgs,
    Prisma.BlogTagFindManyArgs
  >(
    prisma.blogTag as unknown as ModelDelegate<
      Prisma.BlogTagCountArgs,
      Prisma.BlogTagFindManyArgs,
      TagWithTranslations
    >,
    { page, pageSize },
    prismaArgs
  );
}

export async function createTag(data: Prisma.BlogTagCreateArgs) {
  return prisma.blogTag.create(data);
}

export async function updateTag(data: Prisma.BlogTagUpdateArgs) {
  return prisma.blogTag.update(data);
}

export async function deleteTag(id: string) {
  return prisma.blogTag.delete({
    where: { id },
  });
}

export async function checkSlugExists(slug: string, excludeId?: string) {
  const tag = await prisma.blogTag.findUnique({
    where: {
      slug,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
  });
  return !!tag;
}

export async function getTag(id: string) {
  return prisma.blogTag.findUnique({
    where: { id },
    include: { translations: true },
  });
}
