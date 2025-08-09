import { Vote } from "@/db/generated/prisma";
import { getChatById, getVotesByChatId, voteMessage } from "@/db/playground";
import { getOrCreatePlayGroundUserByUserId } from "@/db/playground/user";
import { Session } from "next-auth";

export type VoteGetResult = {
  success: boolean;
  error?: string;
  votes?: Vote[];
};

export type VotePatchResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function handleVoteGet({
  chatId,
  session,
}: {
  chatId: string;
  session: Session;
}): Promise<VoteGetResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    const playGroundUser = await getOrCreatePlayGroundUserByUserId(session.user.id);
    if (chat.playGroundUserId !== playGroundUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    const votes = await getVotesByChatId({ id: chatId });

    return { success: true, votes };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}

export async function handleVotePatch({
  chatId,
  messageId,
  type,
  session,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
  session: Session;
}): Promise<VotePatchResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    const playGroundUser = await getOrCreatePlayGroundUserByUserId(session.user.id);
    if (chat.playGroundUserId !== playGroundUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    await voteMessage({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });

    return { success: true, message: "Message voted" };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}
