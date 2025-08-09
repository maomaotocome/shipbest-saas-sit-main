"use client";

import { useRecreateTask } from "@/components/common/ai/RecreateTaskProvider";
import { JsonObject } from "@/types/json";
import { useRouter } from "next/navigation";
import { ExploreItem } from "../../types";
import { createInvokerConfig, parseOriginalRequest } from "../../utils";
import { ExplorePreview } from "./ExplorePreview";

interface ExploreModalWrapperProps {
  item: ExploreItem;
}

export function ExploreModalWrapper({ item }: ExploreModalWrapperProps) {
  const router = useRouter();
  const { openRecreateDialog } = useRecreateTask();

  const handleClose = () => {
    router.back();
  };

  const handleRecreate = () => {
    const invokerConfig = createInvokerConfig(item);
    const parsedRequest = parseOriginalRequest(item.originalRequest);
    
    if (invokerConfig) {
      openRecreateDialog(invokerConfig, parsedRequest as JsonObject, item.type as "image" | "video");
    }
  };

  return (
    <ExplorePreview item={item} isOpen={true} onClose={handleClose} onRecreate={handleRecreate} />
  );
}
