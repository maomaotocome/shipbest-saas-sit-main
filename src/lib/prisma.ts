import { Prisma, PrismaClient } from "@/db/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      {
        emit: "stdout",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "info",
      },
      {
        emit: "stdout",
        level: "warn",
      },
    ],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type TransactionCallback<T> = (tx: Prisma.TransactionClient) => Promise<T>;

export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      return await callback(tx);
    },
    {
      timeout: process.env.NODE_ENV === "production" ? 10000 : 1000000,
    }
  );
}

export type TransactionHandler<TParams, TResult> = (
  params: TParams,
  tx: Prisma.TransactionClient
) => Promise<TResult>;

export function createTransactionRunner<TParams, TResult>(
  handler: TransactionHandler<TParams, TResult>,
  operationName?: string
) {
  return async (params: TParams, tx?: Prisma.TransactionClient): Promise<TResult> => {
    try {
      console.info(`Starting ${operationName}`, { params });

      if (tx) {
        return await handler(params, tx);
      }

      return await withTransaction((newTx) => handler(params, newTx));
    } catch (error) {
      console.error(`Failed to execute ${operationName}`, {
        params,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };
}
