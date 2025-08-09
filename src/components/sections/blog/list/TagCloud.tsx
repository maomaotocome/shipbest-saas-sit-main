import { BlogTag, BlogTagTranslation } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface Props {
  tags: (BlogTag & {
    translations: BlogTagTranslation[];
    _count: { posts: number };
  })[];
  locale: Locale;
}

export default async function TagCloud({ tags, locale }: Props) {
  const t = await getTranslations("blog");
  return (
    <div className="rounded-lg bg-white/70 p-6 backdrop-blur-md dark:bg-white/5 dark:backdrop-blur-lg">
      <h2 className="mb-4 text-xl font-bold dark:text-gray-100">{t("tags")}</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const translation = tag.translations[0];
          if (!translation) return null;

          return (
            <Link
              key={tag.id}
              href={`/${locale}/blog/tag/${tag.slug}`}
              className="rounded-full bg-white px-3 py-1 text-sm text-gray-800 transition-colors hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {translation.name} ({tag._count.posts})
            </Link>
          );
        })}
      </div>
    </div>
  );
}
