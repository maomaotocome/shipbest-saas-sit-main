import { type Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";

const POSTS_PER_PAGE = 10;

export async function getCategoryPosts({
  locale,
  slug,
  page,
}: {
  locale: Locale;
  slug: string;
  page: number;
}) {
  const skip = (page - 1) * POSTS_PER_PAGE;

  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });

  if (!category) return null;

  const [posts, totalPosts, categories, tags] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        publishedAt: { not: null },
        categoryId: category.id,
      },
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
      take: POSTS_PER_PAGE,
    }),
    prisma.blogPost.count({
      where: {
        publishedAt: { not: null },
        categoryId: category.id,
      },
    }),
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

  return { posts, totalPosts, categories, tags, category };
}
