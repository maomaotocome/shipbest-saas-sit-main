"use client";

import { type UIArtifact } from "@/components/playground/artifact";
import { ConsoleOutput } from "@/components/playground/console";
import { type Suggestion } from "@/db/generated/prisma";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export const initialArtifactData: UIArtifact = {
  documentId: "init",
  content: "",
  kind: "text",
  title: "",
  status: "idle",
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

type ArtifactMetadata = {
  [key: string]: unknown;
  suggestions: Array<Suggestion>;
  outputs: Array<ConsoleOutput>;
};

type Selector<T> = (state: UIArtifact) => T;

export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
  const { data: localArtifact } = useQuery<UIArtifact>({
    queryKey: ["artifact"],
    initialData: initialArtifactData,
  });

  const selectedValue = useMemo(() => {
    if (!localArtifact) return selector(initialArtifactData);
    return selector(localArtifact);
  }, [localArtifact, selector]);

  return selectedValue;
}

export function useArtifact() {
  const queryClient = useQueryClient();
  const { data: localArtifact } = useQuery<UIArtifact>({
    queryKey: ["artifact"],
    initialData: initialArtifactData,
  });

  const artifact = useMemo(() => {
    if (!localArtifact) return initialArtifactData;
    return localArtifact;
  }, [localArtifact]);

  const setArtifact = useCallback(
    (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
      queryClient.setQueryData<UIArtifact>(["artifact"], (currentArtifact) => {
        const artifactToUpdate = currentArtifact || initialArtifactData;

        if (typeof updaterFn === "function") {
          return updaterFn(artifactToUpdate);
        }

        return updaterFn;
      });
    },
    [queryClient]
  );

  const { data: localArtifactMetadata } = useQuery<ArtifactMetadata>({
    queryKey: ["artifact-metadata", artifact.documentId],
    enabled: !!artifact.documentId,
    initialData: { suggestions: [], outputs: [] },
  });

  const setMetadata = useCallback(
    (newMetadata: unknown) => {
      queryClient.setQueryData(
        ["artifact-metadata", artifact.documentId],
        newMetadata as ArtifactMetadata
      );
    },
    [queryClient, artifact.documentId]
  );

  return useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata: localArtifactMetadata,
      setMetadata,
    }),
    [artifact, setArtifact, localArtifactMetadata, setMetadata]
  );
}
