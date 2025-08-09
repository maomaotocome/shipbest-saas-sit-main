import { SocialShare } from "@/components/common/social/SocialShare";
import { type Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { PostWithRelations } from "@/types/blog";
import PostContent from "./PostContent";
import { PostHeader } from "./PostHeader";
import { PostImage } from "./PostImage";
import { PostTags } from "./PostTags";

interface Props {
  post: PostWithRelations;
  locale: Locale;
  className?: string;
}

// Make the component async to handle MDX serialization
export default async function BlogPostPage({ post, locale, className }: Props) {
  const translation = post.translations[0];
  if (!translation) return null;
  const content = translation.content;

  return (
    <section className={cn("relative min-h-screen pt-[25vh]", className)}>
      {post.coverImageUrl && <PostImage imageUrl={post.coverImageUrl} title={translation.title} />}

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4">
          {/* Header */}
          <PostHeader
            title={translation.title}
            author={post.author}
            publishedAt={post.publishedAt}
            category={post.category}
            locale={locale}
          />

          {/* Content card */}
          <div
            className={`mt-6 mb-10 overflow-hidden rounded-lg bg-white/70 p-8 text-black/70 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-xs dark:bg-black/70 dark:text-white/70 dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
          >
            <PostContent content={content} />
            <PostTags tags={post.tags} locale={locale} />
            <div className="mt-6 border-t border-black/10 pt-6 dark:border-white/10">
              <SocialShare
                title={translation.title}
                description={translation.metadata || translation.title}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
