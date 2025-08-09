import Pagination from "@/components/common/pagination";
import {
  BlogCategory,
  BlogCategoryTranslation,
  BlogTag,
  BlogTagTranslation,
  Prisma,
} from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import PostCard from "./PostCard";
import Sidebar from "./Sidebar";

interface Props {
  posts: Prisma.BlogPostGetPayload<{
    include: {
      translations: true;
      author: true;
    };
  }>[];
  categories: (BlogCategory & {
    translations: BlogCategoryTranslation[];
    _count: { posts: number };
  })[];
  tags: (BlogTag & {
    translations: BlogTagTranslation[];
    _count: { posts: number };
  })[];
  totalPosts: number;
  currentPage: number;
  type: "all" | "category" | "tag";
  slug?: string;
  category?: BlogCategory & { translations: BlogCategoryTranslation[] };
  tag?: BlogTag & { translations: BlogTagTranslation[] };
  locale: Locale;
  className?: string;
}

const POSTS_PER_PAGE = 10;

export default async function BlogListSection({
  posts,
  categories,
  tags,
  totalPosts,
  currentPage,
  type,
  slug,
  category,
  tag,
  locale,
  className,
}: Props) {
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const t = await getTranslations("blog");

  const getPageUrl = (page: number) => {
    const baseUrl = `/${locale}/blog`;
    if (type === "category") return `${baseUrl}/category/${slug}/${page}`;
    if (type === "tag") return `${baseUrl}/tag/${slug}/${page}`;
    return `${baseUrl}/${page}`;
  };

  return (
    <section className={cn("py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="mb-8 text-3xl font-bold">
              {type === "category" && category?.translations[0]?.name
                ? `${t("categories")}: ${category.translations[0].name}`
                : type === "tag" && tag?.translations[0]?.name
                  ? `${t("tags")}: ${tag.translations[0].name}`
                  : t("title")}
            </h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">{t("description")}</p>
            <div className="space-y-4 md:space-y-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>

            <Pagination totalPages={totalPages} currentPage={currentPage} getPageUrl={getPageUrl} />
          </div>

          <Sidebar categories={categories} tags={tags} locale={locale} />
        </div>
      </div>
    </section>
  );
}
