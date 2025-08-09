import { BlogCategory, BlogCategoryTranslation } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
interface Props {
  categories: (BlogCategory & {
    translations: BlogCategoryTranslation[];
    _count: { posts: number };
  })[];
  locale: Locale;
}

export default async function CategoryList({ categories, locale }: Props) {
  const t = await getTranslations("blog");
  return (
    <div className="rounded-lg bg-white/70 p-6 backdrop-blur-md dark:bg-white/5 dark:backdrop-blur-lg">
      <h2 className="mb-4 text-xl font-bold dark:text-gray-100">{t("categories")}</h2>
      <ul className="space-y-2">
        {categories.map((category) => {
          const translation = category.translations[0];
          if (!translation) return null;

          return (
            <li key={category.id}>
              <Link
                href={`/${locale}/blog/category/${category.slug}`}
                className="flex items-center justify-between text-gray-800 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                <span>{translation.name}</span>
                <span className="text-gray-500 dark:text-gray-400">({category._count.posts})</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
