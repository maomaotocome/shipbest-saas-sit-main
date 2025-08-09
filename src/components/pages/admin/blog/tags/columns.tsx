import { BlogTag, BlogTagTranslation } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";

type TagWithTranslations = BlogTag & {
  translations: BlogTagTranslation[];
};

export const useColumns = (locale: Locale) => {
  return [
    {
      header: "Slug",
      accessorKey: "slug",
    },
    {
      header: "Names",
      accessorKey: "translations",
      cell: (row: TagWithTranslations) =>
        row.translations.filter((trans) => trans.locale === locale).map((trans) => trans.name),
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (row: TagWithTranslations) => {
        // Use a consistent date format
        const date = new Date(row.createdAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      },
    },
  ];
};
