"use server";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { TaskWithoutSystemRequestSelect } from "@/types/tasks";
export async function checkTaskStatus(taskIds: string[]) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  return prisma.task.findMany({
    where: {
      id: {
        in: taskIds,
      },
      userId: user.id,
    },
    select: TaskWithoutSystemRequestSelect,
  });
}
