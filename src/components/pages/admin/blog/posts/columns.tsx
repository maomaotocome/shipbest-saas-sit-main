import { Badge } from "@/components/ui/badge";
import { type Locale } from "@/i18n/locales";
import { CategoryWithTranslations, PostWithRelations, TagWithTranslations } from "@/types/blog";
import { useTranslations } from "next-intl";

export const useColumns = (
  locale: Locale,
  categories: CategoryWithTranslations[],
  tags: TagWithTranslations[]
) => {
  const t = useTranslations("admin.blog.posts");

  return [
    {
      header: t("columns.slug"),
      accessorKey: "slug",
    },
    {
      header: t("columns.titles"),
      accessorKey: "translations",
      cell: (row: PostWithRelations) => (
        <div className="space-y-1">
          {row.translations
            .filter((trans) => trans.locale === locale)
            .map((trans) => trans.title)
            .join(", ")}
        </div>
      ),
    },
    {
      header: t("columns.category"),
      accessorKey: "category",
      cell: (row: PostWithRelations) => {
        if (!row.category) return <span className="text-gray-500">-</span>;
        const category = categories.find((c) => c.id === row.categoryId);
        if (!category) return <span className="text-gray-500">-</span>;
        const translation = category.translations.find((t) => t.locale === locale);
        return <Badge variant="outline">{translation?.name || category.slug}</Badge>;
      },
    },
    {
      header: t("columns.tags"),
      accessorKey: "tags",
      cell: (row: PostWithRelations) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.map(({ tag }, index) => {
            const tagData = tags.find((t) => t.id === tag.id);
            const translation = tagData?.translations.find((t) => t.locale === locale);
            return (
              <Badge key={`${row.id}-${tag.id || index}`} variant="secondary">
                {translation?.name || tag.slug}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      header: t("columns.author"),
      accessorKey: "author",
      cell: (row: PostWithRelations) => row.author.name,
    },
    {
      header: t("columns.status"),
      accessorKey: "publishedAt",
      cell: (row: PostWithRelations) => (
        <Badge variant={row.publishedAt ? "secondary" : "default"}>
          {row.publishedAt ? t("status.published") : t("status.draft")}
        </Badge>
      ),
    },
  ];
};
