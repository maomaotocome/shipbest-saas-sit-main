import { v4 as uuidv4 } from "uuid";
import { handleOpenAINextResponse } from "./response-handler";

const API_URL = "https://api.openai-next.com/v1/chat/completions";

export async function submitOpenAINextTask(
  openaiNextModel: string,
  input: {
    prompt: string;
    images_url?: string[];
  },
  taskId: string,
  subTaskId: string
) {
  const uuid = uuidv4();
  callOpenAINext(openaiNextModel, input)
    .then((res) => handleOpenAINextResponse(res, uuid, taskId, subTaskId))
    .catch(async (error) => {
      await handleOpenAINextResponse(null, uuid, taskId, subTaskId, error);
    });
  return { request_id: uuid };
}

async function callOpenAINext(
  openaiNextModel: string,
  input: {
    prompt: string;
    images_url?: string[];
  }
) {
  const apiKey = process.env.OPENAI_NEXT_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_NEXT_API_KEY environment variable is not set");
  }
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream: true,
        model: openaiNextModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: input.prompt as string,
              },
              ...(input.images_url && input.images_url.length > 0
                ? input.images_url.map((url) => ({
                    type: "image_url",
                    image_url: {
                      url,
                    },
                  }))
                : []),
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to process OpenAI Next response: ${response.statusText} ${response.status}`
      );
    }
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred");
  }
}
