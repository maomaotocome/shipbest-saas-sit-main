import { BaseModel } from "@/conifg/aigc/types";
import { JsonObject } from "@/types/json";
import { useMemo } from "react";

export function useModelRecallable(config: BaseModel | null, request: Record<string, unknown>) {
  return useMemo(() => {
    if (!config?.recallable) {
      return false;
    }

    // If recallable is a boolean, return it directly
    if (typeof config.recallable === "boolean") {
      return config.recallable;
    }

    // If recallable is a function, call it with the task request
    if (typeof config.recallable === "function") {
      try {
        return config.recallable(request as JsonObject);
      } catch (error) {
        console.error("Error evaluating recallable function:", error);
        return false;
      }
    }

    return false;
  }, [config, request]);
}