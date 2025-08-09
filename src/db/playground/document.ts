import { prisma } from "@/lib/prisma";
export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: string;
  content: string;
  userId: string;
}) {
  try {
    const playGroundUser = await prisma.playGroundUser.findUnique({
      where: { userId },
    });

    if (!playGroundUser) {
      throw new Error("Playground user not found");
    }

    return await prisma.document.create({
      data: {
        id,
        title,
        kind,
        content,
        playGroundUserId: playGroundUser.id,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to save document in database");
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    return await prisma.document.findFirst({
      where: { id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await prisma.suggestion.deleteMany({
      where: {
        documentId: id,
        documentCreatedAt: {
          gt: timestamp,
        },
      },
    });

    return await prisma.document.deleteMany({
      where: {
        id,
        createdAt: {
          gt: timestamp,
        },
      },
    });
  } catch (error) {
    console.error("Failed to delete documents by id after timestamp from database");
    throw error;
  }
}
