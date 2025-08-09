"use client";

import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { createContext, ReactNode, useContext, useState } from "react";
import { RecreateTaskDialog } from "./RecreateTaskDialog";

type RecreateTaskInvokerConfig =
  | {
      taskType: TaskType.Template;
      metadata: JsonObject;
    }
  | {
      taskType: TaskType.ModelDirectInvocation;
      metadata: JsonObject;
    }
  | null;

interface RecreateTaskContextType {
  openRecreateDialog: (
    invokerConfig: RecreateTaskInvokerConfig,
    initialRequest: JsonObject,
    demoType: "image" | "video" | "audio"
  ) => void;
  closeRecreateDialog: () => void;
}

const RecreateTaskContext = createContext<RecreateTaskContextType | undefined>(undefined);

interface RecreateTaskProviderProps {
  children: ReactNode;
}

export function RecreateTaskProvider({ children }: RecreateTaskProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [invokerConfig, setInvokerConfig] = useState<RecreateTaskInvokerConfig>(null);
  const [initialRequest, setInitialRequest] = useState<JsonObject>({});
  const [demoType, setDemoType] = useState<"image" | "video" | "audio">("image");

  const openRecreateDialog = (
    config: RecreateTaskInvokerConfig,
    request: JsonObject,
    type: "image" | "video" | "audio"
  ) => {
    setInvokerConfig(config);
    setInitialRequest(request);
    setDemoType(type);
    setIsOpen(true);
  };

  const closeRecreateDialog = () => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => {
      setInvokerConfig(null);
      setInitialRequest({});
      setDemoType("image");
    }, 200);
  };

  return (
    <RecreateTaskContext.Provider value={{ openRecreateDialog, closeRecreateDialog }}>
      {children}
      <RecreateTaskDialog
        open={isOpen}
        onOpenChange={closeRecreateDialog}
        invokerConfig={invokerConfig}
        initialRequest={initialRequest}
        demoType={demoType}
      />
    </RecreateTaskContext.Provider>
  );
}

export function useRecreateTask() {
  const context = useContext(RecreateTaskContext);
  if (context === undefined) {
    throw new Error("useRecreateTask must be used within a RecreateTaskProvider");
  }
  return context;
}
