import type { Document } from "@/db/generated/prisma";
export function getDocumentTimestampByIndex(documents: Array<Document> | undefined, index: number) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}
