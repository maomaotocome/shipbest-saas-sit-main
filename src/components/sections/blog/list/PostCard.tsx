import { Prisma } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { useFormatter } from "next-intl";
import Image from "next/image";
import Link from "next/link";
interface Props {
  post: Prisma.BlogPostGetPayload<{
    include: {
      translations: true;
      author: true;
    };
  }>;
  locale: Locale;
  h3Title?: boolean;
}

export default function PostCard({ post, locale, h3Title = false }: Props) {
  const translation = post.translations[0];
  const format = useFormatter();
  if (!translation) return null;

  return (
    <article className="group relative mb-2 overflow-hidden rounded-lg bg-black/5 shadow-2xl shadow-black/20 transition-shadow duration-200 md:mb-8 dark:bg-white/1 dark:shadow-white/10 dark:hover:shadow-white/20">
      <Link href={`/${locale}/blog/${post.slug}`}>
        {post.coverImageUrl && (
          <div className="relative h-[240px] w-full">
            <Image
              src={post.coverImageUrl}
              alt={translation.title}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              unoptimized={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}
        <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
          {h3Title ? (
            <h3 className="mb-2 text-lg font-bold">{translation.title}</h3>
          ) : (
            <h2 className="mb-2 text-xl font-bold">{translation.title}</h2>
          )}
          <div className="mb-4 text-sm font-extralight text-white/80">
            <span>{post.author.name}</span>
            <span className="mx-2">•</span>
            <span>
              {post.publishedAt
                ? format.dateTime(new Date(post.publishedAt), { dateStyle: "medium" })
                : ""}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
