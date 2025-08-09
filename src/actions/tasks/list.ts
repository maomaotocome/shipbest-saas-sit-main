"use server";

import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { TaskWithoutSystemRequestSelect } from "@/types/tasks";
export async function listTasks(params: {
  cursor?: string;
  take?: number;
  before?: Date;
  after?: Date;
}) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  const { cursor, take = 5, before, after } = params;

  const tasks = await prisma.task.findMany({
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      ...(before ? { createdAt: { lt: before } } : {}),
      ...(after ? { createdAt: { gt: after } } : {}),
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: TaskWithoutSystemRequestSelect,
  });

  const nextCursor = tasks.length === take ? tasks[tasks.length - 1].id : undefined;

  return {
    items: tasks,
    nextCursor,
  };
}
