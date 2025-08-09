import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from "ai";
const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const myProvider = customProvider({
  languageModels: {
    "chat-model": openRouter.chat("anthropic/claude-3.7-sonnet"),
    "chat-model-reasoning": wrapLanguageModel({
      model: openRouter.chat("anthropic/claude-3.7-sonnet:thinking"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openRouter.chat("anthropic/claude-3.7-sonnet"),
    "artifact-model": openRouter.chat("anthropic/claude-3.7-sonnet"),
  },
  imageModels: {
    "small-model": xai.image("grok-2-image"),
  },
});
