"use client";

import { updateChatVisibility } from "@/artifacts/actions";
import { Chat } from "@/db/generated/prisma";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { VisibilityType } from "../visibility-selector";
export interface ChatHistory {
  chats: Array<Chat>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function getChatHistoryPaginationKey(pageIndex: number, previousPageData: ChatHistory) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/playground/history?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousPageData.chats.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/playground/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

export function useChatVisibility({
  chatId,
  initialVisibility,
}: {
  chatId: string;
  initialVisibility: VisibilityType;
}) {
  const queryClient = useQueryClient();
  const history = queryClient.getQueryData<ChatHistory>(["/api/playground/history"]);

  const { data: localVisibility } = useQuery<VisibilityType>({
    queryKey: [`${chatId}-visibility`],
    initialData: initialVisibility,
  });

  const visibilityType = useMemo(() => {
    if (!history) return localVisibility;
    const chat = history.chats.find((chat: Chat) => chat.id === chatId);
    if (!chat) return "private";
    return chat.visibility;
  }, [history, chatId, localVisibility]);

  const setVisibilityType = async (updatedVisibilityType: VisibilityType) => {
    // Update local state
    queryClient.setQueryData([`${chatId}-visibility`], updatedVisibilityType);

    // Invalidate chat history to trigger a refetch
    await queryClient.invalidateQueries({
      queryKey: getChatHistoryPaginationKey(0, { chats: [], hasMore: true }),
    });

    // Update server state
    await updateChatVisibility({
      chatId: chatId,
      visibility: updatedVisibilityType,
    });
  };

  return { visibilityType, setVisibilityType };
}
