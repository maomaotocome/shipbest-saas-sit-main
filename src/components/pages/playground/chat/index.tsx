import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Chat } from "@/components/playground/chat";
import { DataStreamHandler } from "@/components/playground/data-stream-handler";
import { VisibilityType } from "@/components/playground/visibility-selector";
import { Message as DBMessage } from "@/db/generated/prisma";
import {
  getChatById,
  getMessagesByChatId,
  getOrCreatePlayGroundUserByUserId,
} from "@/db/playground";
import { auth } from "@/lib/auth";
import { DEFAULT_CHAT_MODEL } from "@/services/playground/ai/models";
import { Attachment, UIMessage } from "ai";

interface props {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function Page({ params }: props) {
  const { chatId } = await params;
  const chat = await getChatById({ id: chatId });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === "private") {
    if (!session || !session.user) {
      return notFound();
    }

    if ((await getOrCreatePlayGroundUserByUserId(session.user.id)).id !== chat.playGroundUserId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id: chatId,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: "",
      createdAt: message.createdAt,
      experimental_attachments: (message.attachments as unknown as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType={chat.visibility as VisibilityType}
          isReadonly={
            (await getOrCreatePlayGroundUserByUserId(session?.user?.id ?? "")).id !==
            chat.playGroundUserId
          }
        />
        <DataStreamHandler id={chat.id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility as VisibilityType}
        isReadonly={
          (await getOrCreatePlayGroundUserByUserId(session?.user?.id ?? "")).id !==
          chat.playGroundUserId
        }
      />
      <DataStreamHandler id={chat.id} />
    </>
  );
}
