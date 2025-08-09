import { Suggestion } from "@/db/generated/prisma";
import { getOrCreatePlayGroundUserByUserId, getSuggestionsByDocumentId } from "@/db/playground";
import { Session } from "next-auth";

export type SuggestionsGetResult = {
  success: boolean;
  error?: string;
  suggestions?: Suggestion[];
};

export async function handleSuggestionsGet({
  documentId,
  session,
}: {
  documentId: string;
  session: Session;
}): Promise<SuggestionsGetResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const suggestions = await getSuggestionsByDocumentId({
      documentId,
    });

    const [suggestion] = suggestions;

    if (!suggestion) {
      return { success: true, suggestions: [] };
    }

    const playGroundUser = await getOrCreatePlayGroundUserByUserId(session.user.id);
    if (suggestion.playGroundUserId !== playGroundUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, suggestions };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}
