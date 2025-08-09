"use client";

import { ChatHeader } from "@/components/playground/chat-header";
import { useArtifactSelector } from "@/components/playground/hooks/use-artifact";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Vote } from "@/db/generated/prisma";
import { generateUUID } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Attachment, Message } from "ai";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Artifact } from "./artifact";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const queryClient = useQueryClient();

  const { messages, setMessages, handleSubmit, input, setInput, append, status, stop, reload } =
    useChat({
      api: "/api/playground/chat",
      id,
      body: { id, selectedChatModel: selectedChatModel },
      initialMessages,
      experimental_throttle: 100,
      sendExtraMessageFields: true,
      generateId: generateUUID,

      onFinish: () => {
        queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      },
      onError: () => {
        toast.error("An error occurred, please try again!");
      },
    });

  const { data: votes } = useQuery<Array<Vote>>({
    queryKey: ["votes", id],
    queryFn: async () => {
      if (messages.length < 2) return [];
      const response = await fetch(`/api/playground/vote?chatId=${id}`);
      if (!response.ok) throw new Error("Failed to fetch votes");
      return response.json();
    },
    enabled: messages.length >= 2,
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <TooltipProvider>
        <div className="bg-background flex h-dvh min-w-0 flex-col">
          <ChatHeader
            chatId={id}
            selectedModelId={selectedChatModel}
            selectedVisibilityType={selectedVisibilityType}
            isReadonly={isReadonly}
          />

          <Messages
            chatId={id}
            status={status}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            isArtifactVisible={isArtifactVisible}
          />

          <form className="bg-background mx-auto flex w-full gap-2 px-4 pb-4 md:max-w-3xl md:pb-6">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                status={status}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                append={append}
              />
            )}
          </form>
        </div>

        <Artifact
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          append={append}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          votes={votes}
          isReadonly={isReadonly}
        />
      </TooltipProvider>
    </>
  );
}
