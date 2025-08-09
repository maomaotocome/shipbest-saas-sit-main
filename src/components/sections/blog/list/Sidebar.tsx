import {
  BlogCategory,
  BlogCategoryTranslation,
  BlogTag,
  BlogTagTranslation,
} from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import CategoryList from "./CategoryList";
import TagCloud from "./TagCloud";

interface Props {
  categories: (BlogCategory & {
    translations: BlogCategoryTranslation[];
    _count: { posts: number };
  })[];
  tags: (BlogTag & {
    translations: BlogTagTranslation[];
    _count: { posts: number };
  })[];
  locale: Locale;
}

export default function Sidebar({ categories, tags, locale }: Props) {
  return (
    <div className="col-span-12 space-y-8 lg:col-span-4">
      <CategoryList categories={categories} locale={locale} />
      <TagCloud tags={tags} locale={locale} />
    </div>
  );
}
