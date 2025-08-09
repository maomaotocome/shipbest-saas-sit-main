import { type Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";

const POSTS_PER_PAGE = 10;

export async function getBlogData({
  locale,
  page,
  begin,
  end,
}: {
  locale: Locale;
  page?: number;
  begin?: number;
  end?: number;
}) {
  if (undefined === page && undefined === begin && undefined === end) {
    throw new Error("page, begin, end could not be null at the same time");
  }

  let skip: number | undefined;
  let take: number | undefined;
  if (undefined !== page) {
    skip = (page - 1) * POSTS_PER_PAGE;
    take = POSTS_PER_PAGE;
  }

  if (undefined !== begin && undefined !== end) {
    if (end < begin) {
      throw new Error("end must be greater than begin");
    }
    skip = begin;
    take = end - begin;
  }

  const [posts, totalPosts, categories, tags] = await Promise.all([
    prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      include: {
        translations: { where: { locale } },
        author: true,
        category: {
          include: {
            translations: { where: { locale } },
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: { where: { locale } },
              },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    }),
    prisma.blogPost.count({ where: { publishedAt: { not: null } } }),
    prisma.blogCategory.findMany({
      include: {
        translations: { where: { locale } },
        _count: { select: { posts: true } },
      },
    }),
    prisma.blogTag.findMany({
      include: {
        translations: { where: { locale } },
        _count: { select: { posts: true } },
      },
    }),
  ]);

  return { posts, totalPosts, categories, tags };
}
