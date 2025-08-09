import { type Locale } from "@/i18n/locales";
import { TagWithTranslations } from "@/types/blog";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface Props {
  tags: Array<{ tag: TagWithTranslations }>;
  locale: Locale;
}

export async function PostTags({ tags, locale }: Props) {
  const t = await getTranslations("blog");
  if (tags.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="mb-4 text-xl font-bold">{t("tags")}</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag }) => (
          <Link
            key={tag.id}
            href={`/${locale}/blog/tag/${tag.slug}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-blue-50 dark:bg-gray-800"
          >
            {tag.translations[0]?.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
