import { BlogAuthor } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { CategoryWithTranslations } from "@/types/blog";
import Link from "next/link";

interface Props {
  title: string;
  author: BlogAuthor;
  publishedAt: Date | null;
  category?: CategoryWithTranslations | null;
  locale: Locale;
}

export function PostHeader({ title, author, publishedAt, category, locale }: Props) {
  const formattedDate = publishedAt ? new Date(publishedAt).toISOString().split("T")[0] : "";

  return (
    <div className="text-center">
      <h1 className="mb-6 text-xl font-bold text-black drop-shadow-lg md:text-3xl lg:text-5xl dark:text-white">
        {title}
      </h1>
      <div className="flex items-center justify-center space-x-4 text-black/70 dark:text-white/90">
        <div className="drop-shadow-sm">{author.name}</div>
        <div className="drop-shadow-sm">•</div>
        <div className="drop-shadow-sm">{formattedDate}</div>
        {category?.translations[0] && (
          <>
            <div className="drop-shadow-sm">•</div>
            <Link
              href={`/${locale}/blog/category/${category.slug}`}
              className="drop-shadow-sm transition hover:text-blue-200"
            >
              {category.translations[0].name}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
