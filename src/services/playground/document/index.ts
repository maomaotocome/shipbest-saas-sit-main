import { ArtifactKind } from "@/components/playground/artifact";
import { Document } from "@/db/generated/prisma";
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentById,
  getOrCreatePlayGroundUserByUserId,
  saveDocument,
} from "@/db/playground";
import { Session } from "next-auth";

export type DocumentGetResult = {
  success: boolean;
  error?: string;
  document?: Document;
};

export type DocumentPostResult = {
  success: boolean;
  error?: string;
  document?: Document;
};

export type DocumentPatchResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function handleDocumentGet({
  id,
  session,
}: {
  id: string;
  session: Session;
}): Promise<DocumentGetResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const document = await getDocumentById({ id });

    if (!document) {
      return { success: false, error: "Not Found" };
    }

    const playGroundUser = await getOrCreatePlayGroundUserByUserId(session.user.id);
    if (document.playGroundUserId !== playGroundUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, document };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}

export async function handleDocumentPost({
  id,
  content,
  title,
  kind,
  session,
}: {
  id: string;
  content: string;
  title: string;
  kind: ArtifactKind;
  session: Session;
}): Promise<DocumentPostResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const document = await saveDocument({
      id,
      content,
      title,
      kind,
      userId: session.user.id,
    });

    return { success: true, document };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}

export async function handleDocumentPatch({
  id,
  timestamp,
  session,
}: {
  id: string;
  timestamp: string;
  session: Session;
}): Promise<DocumentPatchResult> {
  try {
    if (!session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const document = await getDocumentById({ id });

    if (!document) {
      return { success: false, error: "Not Found" };
    }

    const playGroundUser = await getOrCreatePlayGroundUserByUserId(session.user.id);
    if (document.playGroundUserId !== playGroundUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    await deleteDocumentsByIdAfterTimestamp({
      id,
      timestamp: new Date(timestamp),
    });

    return { success: true, message: "Deleted" };
  } catch (error) {
    return { success: false, error: `An error occurred while processing your request! ${error}` };
  }
}
