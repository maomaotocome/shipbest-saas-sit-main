import { Prisma } from "@/db/generated/prisma";

export type FeatureGetPayload = Prisma.FeatureGetPayload<{
  include: {
    translations: true;
  };
}>;
