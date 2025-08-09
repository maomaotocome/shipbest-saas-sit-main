import { Chat } from "@/db/generated/prisma";
import { getChatsByUserId } from "@/db/playground";
import { Session } from "next-auth";

export type HistoryGetResult = {
  success: boolean;
  error?: string;
  chats?: Chat[];
};

export async function handleHistoryGet({
  limit,
  startingAfter,
  endingBefore,
  session,
}: {
  limit: number;
  startingAfter?: Date;
  endingBefore?: Date;
  session: Session;
}): Promise<HistoryGetResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (startingAfter && endingBefore) {
      return {
        success: false,
        error: "Only one of starting_after or ending_before can be provided!",
      };
    }

    const chats = await getChatsByUserId({
      userId: session.user.id,
      limit,
      startingAfter,
      endingBefore,
    });

    return { success: true, chats };
  } catch (error) {
    return { success: false, error: `Failed to fetch chats! ${error}` };
  }
}
