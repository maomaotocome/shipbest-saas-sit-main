import { Prisma } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { PostWithRelations } from "@/types/blog";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

interface GetAllPostsParams extends PaginationParams {
  searchTitle?: string;
  searchAuthor?: string;
}

export async function getAllPosts({
  page,
  pageSize,
  searchTitle,
  searchAuthor,
}: GetAllPostsParams): Promise<PaginatedResponse<PostWithRelations>> {
  const where: Prisma.BlogPostWhereInput = {};
  const conditions: Prisma.BlogPostWhereInput[] = [];

  if (searchTitle) {
    conditions.push({
      translations: {
        some: {
          title: { contains: searchTitle, mode: Prisma.QueryMode.insensitive },
        },
      },
    });
  }

  if (searchAuthor) {
    conditions.push({
      author: {
        name: { contains: searchAuthor, mode: Prisma.QueryMode.insensitive },
      },
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const prismaArgs: Omit<Prisma.BlogPostFindManyArgs, "skip" | "take"> = {
    where,
    include: {
      translations: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  return paginatePrismaQuery<
    PostWithRelations,
    Prisma.BlogPostCountArgs,
    Prisma.BlogPostFindManyArgs
  >(
    prisma.blogPost as unknown as ModelDelegate<
      Prisma.BlogPostCountArgs,
      Prisma.BlogPostFindManyArgs,
      PostWithRelations
    >,
    { page, pageSize },
    prismaArgs
  );
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      translations: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function createPost(params: Prisma.BlogPostCreateArgs) {
  return prisma.blogPost.create(params);
}

export async function updatePost(data: Prisma.BlogPostUpdateArgs) {
  return prisma.blogPost.update(data);
}

export async function deletePost(id: string) {
  return prisma.blogPost.delete({
    where: { id },
  });
}

export async function checkSlugExists(slug: string, excludeId?: string) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
  });
  return !!post;
}
