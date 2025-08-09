import { prisma } from "@/lib/prisma";
export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<{
    documentId: string;
    documentCreatedAt: Date;
    originalText: string;
    suggestedText: string;
    description?: string;
    playGroundUserId: string;
  }>;
}) {
  try {
    return await prisma.suggestion.createMany({
      data: suggestions,
    });
  } catch (error) {
    console.error("Failed to save suggestions in database");
    throw error;
  }
}

export async function getSuggestionsByDocumentId({ documentId }: { documentId: string }) {
  try {
    return await prisma.suggestion.findMany({
      where: { documentId },
    });
  } catch (error) {
    console.error("Failed to get suggestions by document id from database");
    throw error;
  }
}

export async function getSuggestionById({ id }: { id: string }) {
  try {
    return await prisma.suggestion.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to get suggestion by id from database");
    throw error;
  }
}

export async function voteSuggestion({
  suggestionId,
  isResolved,
}: {
  suggestionId: string;
  isResolved: boolean;
}) {
  try {
    return await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { isResolved },
    });
  } catch (error) {
    console.error("Failed to vote suggestion in database");
    throw error;
  }
}
