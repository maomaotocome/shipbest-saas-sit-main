import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { createOssClient } from "../providers/createClient";

const EXPIRES = 60 * 60;

export const getViewInfo = unstable_cache(
  handleGetViewInfo,
  ["getViewInfo", "objectId", "userId"],
  {
    revalidate: EXPIRES,
  }
);

async function handleGetViewInfo({
  userId,
  objectId,
  isAdmin = false,
}: {
  userId: string;
  objectId: string;
  isAdmin?: boolean;
}) {
  const object = await prisma.ossObject.findUnique({
    where: {
      id: objectId,
      ...(!isAdmin
        ? {
            OR: [
              {
                user: {
                  id: userId,
                },
              },
              {
                bucket: {
                  isPublic: true,
                },
              },
            ],
          }
        : {}),
    },
    include: {
      bucket: true,
    },
  });
  if (!object) {
    throw new Error("Object not found");
  }
  const ossClient = createOssClient(object.bucket);

  const url = object.bucket.isPublic
    ? await ossClient.getPublicUrl(object.key)
    : await ossClient.getSignedGetUrl(object.key, EXPIRES);
  if (!url) {
    throw new Error("Object not found");
  }
  return {
    url,
    isPublic: object.bucket.isPublic,
    type: object.type,
  };
}
