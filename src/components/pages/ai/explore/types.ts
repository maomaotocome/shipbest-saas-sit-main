import { Prisma } from "@/db/generated/prisma";

export type ExploreItem = Prisma.ExploreItemGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
  };
}>;
