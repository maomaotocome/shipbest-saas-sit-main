import { getPost } from "@/db/blog";
import { type Locale } from "@/i18n/locales";
import { getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: Locale; uri?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, uri } = await params;
  const t = await getTranslations("blog.metadata");
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "";

  const defaultMetadata = getMetadata({
    params: {
      title: `${t("all.title")} | ${siteName}`,
      description: t("all.description"),
      keywords: t("all.keywords"),
      uri: "/blog",
    },
  });
  if (!uri) {
    return defaultMetadata;
  }

  if (uri.length === 1 && !uri[0].match(/^\d+$/)) {
    const post = await getPost(locale, uri[0]);
    if (!post) return defaultMetadata;

    return getMetadata({
      params: {
        title: `${post.translations.find((t) => t.locale === locale)?.title} | ${siteName}`,
        description:
          post.translations.find((t) => t.locale === locale)?.metadata || t("post.description"),
        keywords:
          post.translations.find((t) => t.locale === locale)?.metadata || t("post.keywords"),
        coverImageUrl: post.coverImageUrl || undefined,
        uri: `/blog/${uri[0]}`,
      },
    });
  }

  if (uri[0] === "category" && uri.length === 2) {
    return getMetadata({
      params: {
        title: `${t("category.title", { category: uri[1] })} | ${siteName}`,
        description: t("category.description", { category: uri[1] }),
        keywords: t("category.keywords", { category: uri[1] }),
        uri: `/blog/category/${uri[1]}`,
      },
    });
  }

  if (uri[0] === "tag" && uri.length === 2) {
    return getMetadata({
      params: {
        title: `${t("tag.title", { tag: uri[1] })} | ${siteName}`,
        description: t("tag.description", { tag: uri[1] }),
        keywords: t("tag.keywords", { tag: uri[1] }),
        uri: `/blog/tag/${uri[1]}`,
      },
    });
  }

  return getMetadata({
    params: {
      title: `${t("all.title")} | ${siteName}`,
      description: t("all.description"),
      keywords: t("all.keywords"),
      uri: "/blog",
    },
  });
}
