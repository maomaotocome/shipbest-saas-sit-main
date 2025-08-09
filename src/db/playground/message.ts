import { Prisma } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
export async function saveMessages({
  messages,
}: {
  messages: Array<{
    id: string;
    chatId: string;
    role: string;
    parts: Prisma.InputJsonValue;
    attachments: Prisma.InputJsonValue;
    createdAt: Date;
  }>;
}) {
  try {
    return await prisma.message.createMany({
      data: messages,
    });
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await prisma.message.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await prisma.message.findMany({
      where: {
        chatId,
        createdAt: {
          gte: timestamp,
        },
      },
      select: {
        id: true,
      },
    });

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await prisma.vote.deleteMany({
        where: {
          chatId,
          messageId: {
            in: messageIds,
          },
        },
      });

      return await prisma.message.deleteMany({
        where: {
          chatId,
          id: {
            in: messageIds,
          },
        },
      });
    }
  } catch (error) {
    console.error("Failed to delete messages by id after timestamp from database");
    throw error;
  }
}
