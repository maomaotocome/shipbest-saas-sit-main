import { Prisma } from "@/db/generated/prisma";

export const PostWithRelationsInclude = {
  include: {
    translations: true,
    author: true,
    category: {
      include: {
        translations: true,
      },
    },
    tags: {
      include: {
        tag: {
          include: {
            translations: true,
          },
        },
      },
    },
  },
};
export type PostWithRelations = Prisma.BlogPostGetPayload<typeof PostWithRelationsInclude>;

export type CategoryWithTranslations = Prisma.BlogCategoryGetPayload<{
  include: {
    translations: true;
  };
}>;

export type TagWithTranslations = Prisma.BlogTagGetPayload<{
  include: {
    translations: true;
  };
}>;
