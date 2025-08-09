import { prisma } from "@/lib/prisma";
import { getOrCreatePlayGroundUserByUserId } from "./user";
export async function getChatsByUserId({
  userId,
  limit,
  startingAfter,
  endingBefore,
}: {
  userId: string;
  limit: number;
  startingAfter?: Date;
  endingBefore?: Date;
}) {
  try {
    return await prisma.chat.findMany({
      where: {
        playGroundUser: {
          userId,
        },
        ...(startingAfter && {
          createdAt: {
            gt: startingAfter,
          },
        }),
        ...(endingBefore && {
          createdAt: {
            lt: endingBefore,
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to get chats by user id from database");
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    const playGroundUser = await getOrCreatePlayGroundUserByUserId(userId);

    if (!playGroundUser) {
      throw new Error("Playground user not found");
    }

    return await prisma.chat.create({
      data: {
        id,
        title,
        playGroundUserId: playGroundUser.id,
      },
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { visibility },
    });
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}
