import { Locale } from "@/i18n/locales";
import { myProvider } from "@/services/playground/ai/providers";
import { generateText, Message } from "ai";

export async function generateTitleFromUserMessage({
  message,
  locale,
}: {
  message: Message;
  locale: Locale;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel("title-model"),
    system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - the title should be a summary of the user's message
      - do not use quotes or colons
      - the title language should be in ${locale} or based on the user's message
      - !!! ensure it is not more than 80 characters long !!!`,
    prompt: JSON.stringify(message),
  });

  return title;
}
