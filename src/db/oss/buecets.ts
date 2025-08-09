import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner, prisma } from "@/lib/prisma";

export type OssBucketGetPayload = Prisma.OssBucketGetPayload<{
  include: {
    _count: {
      select: { objects: true };
    };
  };
}>;

export async function getOssBuckets() {
  return prisma.ossBucket.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          objects: true,
        },
      },
    },
  });
}

export async function getOssBucketById(id: string) {
  console.info("Getting bucket by id:", id);
  const bucket = await prisma.ossBucket.findUnique({
    where: { id },
  });
  console.info("Found bucket:", bucket);
  return bucket;
}

const handleGetOneAvailableOssBucket = async ({ isPublic }: { isPublic: boolean }) => {
  return prisma.ossBucket.findFirst({
    where: {
      isPublic,
      status: "ACTIVE",
    },
  });
};
export const getOneAvailableOssBucket = createTransactionRunner(
  handleGetOneAvailableOssBucket,
  "getOneAvailableOssBucket"
);

export async function createOssBucket(data: Prisma.OssBucketCreateArgs) {
  return prisma.ossBucket.create(data);
}

export async function updateOssBucket(data: Prisma.OssBucketUpdateArgs) {
  return prisma.ossBucket.update(data);
}

export async function deleteOssBucket(id: string) {
  return prisma.ossBucket.delete({
    where: { id },
  });
}
