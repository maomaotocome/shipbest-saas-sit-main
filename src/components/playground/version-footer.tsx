"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAfter } from "date-fns";
import { motion } from "framer-motion";
import { useWindowSize } from "usehooks-ts";

import { getDocumentTimestampByIndex } from "@/artifacts/utils";
import type { Document } from "@/db/generated/prisma";

import { Button } from "@/components/ui/button";
import { useArtifact } from "./hooks/use-artifact";
import { LoaderIcon } from "./icons";

interface VersionFooterProps {
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  documents: Array<Document> | undefined;
  currentVersionIndex: number;
}

export const VersionFooter = ({
  handleVersionChange,
  documents,
  currentVersionIndex,
}: VersionFooterProps) => {
  const { artifact } = useArtifact();
  const queryClient = useQueryClient();

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/playground/document?id=${artifact.documentId}`, {
        method: "PATCH",
        body: JSON.stringify({
          timestamp: getDocumentTimestampByIndex(documents, currentVersionIndex),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to restore version");
      }
      return response.json();
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["documents", artifact.documentId] });

      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData(["documents", artifact.documentId]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["documents", artifact.documentId],
        (old: Array<Document> | undefined) => {
          if (!old) return [];
          return old.filter((document) =>
            isAfter(
              new Date(document.createdAt),
              new Date(getDocumentTimestampByIndex(documents, currentVersionIndex))
            )
          );
        }
      );

      return { previousDocuments };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["documents", artifact.documentId], context?.previousDocuments);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["documents", artifact.documentId] });
    },
  });

  if (!documents) return;

  return (
    <motion.div
      className="bg-background absolute bottom-0 z-50 flex w-full flex-col justify-between gap-4 border-t p-4 lg:flex-row"
      initial={{ y: isMobile ? 200 : 77 }}
      animate={{ y: 0 }}
      exit={{ y: isMobile ? 200 : 77 }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
    >
      <div>
        <div>You are viewing a previous version</div>
        <div className="text-muted-foreground text-sm">Restore this version to make edits</div>
      </div>

      <div className="flex flex-row gap-4">
        <Button disabled={isPending} onClick={() => mutate()}>
          <div>Restore this version</div>
          {isPending && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            handleVersionChange("latest");
          }}
        >
          Back to latest version
        </Button>
      </div>
    </motion.div>
  );
};
