import BlogListSection from "@/components/sections/blog/list";
import BlogPostPage from "@/components/sections/blog/post";
import { getBlogData, getCategoryPosts, getPost, getTagPosts } from "@/db/blog";
import { type Locale } from "@/i18n/locales";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    locale: Locale;
    uri?: string[];
  }>;
}

const getPostWithCache = unstable_cache(
  async (locale: Locale, slug: string) => getPost(locale, slug),
  ["blog-post"],
  {
    revalidate: 3600,
    tags: ["blog-posts"],
  }
);

const getCategoryPostsWithCache = unstable_cache(
  async (params: { locale: Locale; slug: string; page: number }) => getCategoryPosts(params),
  ["blog-category"],
  {
    revalidate: 3600,
    tags: ["blog-categories"],
  }
);

const getTagPostsWithCache = unstable_cache(
  async (params: { locale: Locale; slug: string; page: number }) => getTagPosts(params),
  ["blog-tag"],
  {
    revalidate: 3600,
    tags: ["blog-tags"],
  }
);

const getBlogDataWithCache = unstable_cache(
  async (params: { locale: Locale; page: number }) => getBlogData(params),
  ["blog-data"],
  {
    revalidate: 3600,
    tags: ["blog-data"],
  }
);

export default async function BlogPage({ params }: Props) {
  const { locale, uri: tmpuri } = await params;
  let uri = tmpuri;
  if (!uri) {
    const data = await getBlogDataWithCache({ locale, page: 1 });
    return <BlogListSection {...data} type="all" locale={locale} currentPage={1} />;
  }

  if (uri.length === 1 && !uri[0].match(/^\d+$/)) {
    const post = await getPostWithCache(locale, uri[0]);
    if (!post) return notFound();

    if (!post.category) {
      return notFound();
    }

    return <BlogPostPage post={post} locale={locale} />;
  }

  let page = 1;

  if (uri.length > 0 && uri[uri.length - 1].match(/^\d+$/)) {
    page = parseInt(uri[uri.length - 1]);
    uri = uri.slice(0, -1);
  }

  if (uri[0] === "category" && uri.length === 2) {
    const data = await getCategoryPostsWithCache({ locale, slug: uri[1], page });
    if (!data) return notFound();
    return (
      <BlogListSection {...data} currentPage={page} type="category" slug={uri[1]} locale={locale} />
    );
  }

  if (uri[0] === "tag" && uri.length === 2) {
    const data = await getTagPostsWithCache({ locale, slug: uri[1], page });
    if (!data) return notFound();
    return (
      <BlogListSection {...data} currentPage={page} type="tag" slug={uri[1]} locale={locale} />
    );
  }

  if (uri.length === 0 || (uri.length === 1 && uri[0]?.match(/^\d+$/))) {
    const data = await getBlogDataWithCache({ locale, page });
    return <BlogListSection {...data} currentPage={page} type="all" locale={locale} />;
  }

  return notFound();
}
