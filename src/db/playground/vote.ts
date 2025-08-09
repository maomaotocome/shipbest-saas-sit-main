import { prisma } from "@/lib/prisma";
export async function voteMessage({
  chatId,
  messageId,
  isUpvoted,
}: {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}) {
  try {
    const existingVote = await prisma.vote.findUnique({
      where: {
        chatId_messageId: {
          chatId,
          messageId,
        },
      },
    });

    if (existingVote) {
      return await prisma.vote.update({
        where: {
          chatId_messageId: {
            chatId,
            messageId,
          },
        },
        data: { isUpvoted },
      });
    }

    return await prisma.vote.create({
      data: {
        chatId,
        messageId,
        isUpvoted,
      },
    });
  } catch (error) {
    console.error("Failed to vote message in database");
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await prisma.vote.findMany({
      where: { chatId: id },
    });
  } catch (error) {
    console.error("Failed to get votes by chat id from database");
    throw error;
  }
}
