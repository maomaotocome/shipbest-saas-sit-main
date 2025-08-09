import { getBlogData } from "@/db/blog";
import { type Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { getLocale, getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import PostCard from "../list/PostCard";

const getPostWithCache = unstable_cache(
  async (locale: Locale, count: number) => await getBlogData({ locale, begin: 0, end: count }),
  ["latest-posts"],
  {
    revalidate: 60 * 60,
  }
);

interface LatestPostsProps {
  className?: string;
}

export default async function LatestPosts({ className }: LatestPostsProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("blog");
  const { posts } = await getPostWithCache(locale, 8);

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-primary mb-12 text-center text-3xl font-bold">{t("latest.title")}</h2>
        <p className="text-foreground/80 mb-12 text-center">{t("latest.description")}</p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} h3Title={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
