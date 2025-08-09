import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const EXPIRES = 60 * 60;

export const getObject = unstable_cache(handleGetObject, ["getObject", "objectId"], {
  revalidate: EXPIRES,
});

async function handleGetObject({ objectId }: { objectId: string }) {
  const object = await prisma.ossObject.findUnique({
    where: {
      id: objectId,
    },
    include: {
      bucket: true,
      user: {
        select: {
          id: true,
        },
      },
    },
  });
  return object;
}
