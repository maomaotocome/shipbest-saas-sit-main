"use server";

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  getSuggestionsByDocumentId,
  updateChatVisiblityById,
} from "@/db/playground";
import { cookies } from "next/headers";

export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await getSuggestionsByDocumentId({ documentId });
  return suggestions ?? [];
}
export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}
export async function deleteTrailingMessages({ id }: { id: string }) {
  const message = await getMessageById({ id });

  if (!message) {
    throw new Error("Message not found");
  }

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}
