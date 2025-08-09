import { JsonValue } from "@/types/json";
import { useMemo } from "react";

export function useTaskRequest(taskRequest: JsonValue) {
  return useMemo(() => {
    try {
      return typeof taskRequest === "string" ? JSON.parse(taskRequest) : taskRequest || {};
    } catch {
      return {};
    }
  }, [taskRequest]);
}