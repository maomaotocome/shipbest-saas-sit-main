import { prisma } from "@/lib/prisma";

export const getOrCreatePlayGroundUserByUserId = async (userId: string) => {
  const user = await prisma.playGroundUser.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return user;
};
