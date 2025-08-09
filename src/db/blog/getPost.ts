import { type Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";

export async function getPost(locale: Locale, slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
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
  });

  if (!post || !post.publishedAt) return null;
  return post;
}
