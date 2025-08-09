import { BlogCategory, Prisma } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";

export type { BlogCategory };

type CategoryWithTranslations = Prisma.BlogCategoryGetPayload<{
  include: {
    translations: true;
  };
}>;

export const useColumns = (locale: Locale) => {
  return [
    {
      header: "Slug",
      accessorKey: "slug",
    },
    {
      header: "Names",
      accessorKey: "translations",
      cell: (row: CategoryWithTranslations) =>
        row.translations.filter((trans) => trans.locale === locale).map((trans) => trans.name),
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (row: CategoryWithTranslations) => {
        const date = new Date(row.createdAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      },
    },
  ];
};
