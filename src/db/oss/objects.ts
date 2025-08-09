import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

async function handleCreateOssObject(
  data: Prisma.OssObjectCreateInput,
  tx: Prisma.TransactionClient
) {
  return tx.ossObject.create({
    data,
  });
}

export const createOssObject = createTransactionRunner(handleCreateOssObject, "createOssObject");

async function handleMarkUploadDone(
  { id, userId }: { id: string; userId: string },
  tx: Prisma.TransactionClient
) {
  return tx.ossObject.update({
    where: { id, user: { id: userId } },
    data: { uploaded: true },
  });
}

export const markUploadDone = createTransactionRunner(handleMarkUploadDone, "markUploadDone");

async function handleDeleteOssObject(
  { id, userId }: { id: string; userId: string },
  tx: Prisma.TransactionClient
) {
  return tx.ossObject.delete({ where: { id, user: { id: userId } } });
}

export const deleteOssObject = createTransactionRunner(handleDeleteOssObject, "deleteOssObject");

async function handleGetOssObject(
  params: Prisma.OssObjectFindUniqueArgs,
  tx: Prisma.TransactionClient
) {
  return tx.ossObject.findUnique(params);
}

export const getOssObject = createTransactionRunner(handleGetOssObject, "getOssObject");
