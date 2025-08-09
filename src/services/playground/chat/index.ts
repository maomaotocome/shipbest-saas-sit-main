import {
  deleteChatById,
  getChatById,
  getOrCreatePlayGroundUserByUserId,
  saveChat,
  saveMessages,
} from "@/db/playground";
import { isProductionEnvironment } from "@/lib/constants";
import { generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "@/services/playground/actions/generate-title-from-user-message";
import { systemPrompt } from "@/services/playground/ai/prompts";
import { myProvider } from "@/services/playground/ai/providers";
import { createDocument } from "@/services/playground/ai/tools/create-document";
import { getWeather } from "@/services/playground/ai/tools/get-weather";
import { requestSuggestions } from "@/services/playground/ai/tools/request-suggestions";
import { updateDocument } from "@/services/playground/ai/tools/update-document";
import { getMostRecentUserMessage, getTrailingMessageId } from "@/services/playground/utils";
import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from "ai";
import { Session } from "next-auth";

export const maxDuration = 60;

export type ChatPostResult = {
  success: boolean;
  error?: string;
  response?: Response;
};

export type ChatDeleteResult = {
  success: boolean;
  error?: string;
  message?: string;
};

function convertMessageToJson(message: UIMessage, chatId: string) {
  return {
    id: message.id,
    chatId,
    role: message.role,
    parts: message.parts?.map((part) => JSON.parse(JSON.stringify(part))) ?? [],
    attachments:
      message.experimental_attachments?.map((attachment) =>
        JSON.parse(JSON.stringify(attachment))
      ) ?? [],
    createdAt: new Date(),
  };
}

export async function handleChatPost({
  id,
  messages,
  selectedChatModel,
  session,
}: {
  id: string;
  messages: Array<UIMessage>;
  selectedChatModel: string;
  session: Session;
}): Promise<ChatPostResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return { success: false, error: "No user message found" };
    }

    const chat = await getChatById({ id });

    if (chat) {
      const playGroundUser = await getOrCreatePlayGroundUserByUserId(session.user.id);
      if (chat.playGroundUserId !== playGroundUser.id) {
        return { success: false, error: "Unauthorized" };
      }
    } else {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
        locale: "en", // TODO: Get locale from user preferences
      });

      await saveChat({ id, userId: session.user.id, title });
    }

    await saveMessages({
      messages: [convertMessageToJson(userMessage, id)],
    });

    const response = createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === "chat-model-reasoning"
              ? []
              : ["getWeather", "createDocument", "updateDocument", "requestSuggestions"],
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter((message) => message.role === "assistant"),
                });

                if (!assistantId) {
                  throw new Error("No assistant message found!");
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                const assistantUIMessage: UIMessage = {
                  id: assistantId,
                  role: assistantMessage.role,
                  content: assistantMessage.content,
                  parts: assistantMessage.parts ?? [],
                  experimental_attachments: assistantMessage.experimental_attachments ?? [],
                };

                await saveMessages({
                  messages: [convertMessageToJson(assistantUIMessage, id)],
                });
              } catch (error) {
                console.error("Failed to save chat", error);
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    return { success: true, response };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}

export async function handleChatDelete({
  id,
  session,
}: {
  id: string;
  session: Session;
}): Promise<ChatDeleteResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const chat = await getChatById({ id });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    const playGroundUser = await getOrCreatePlayGroundUserByUserId(session.user.id);
    if (chat.playGroundUserId !== playGroundUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    await deleteChatById({ id });

    return { success: true, message: "Chat deleted" };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}
