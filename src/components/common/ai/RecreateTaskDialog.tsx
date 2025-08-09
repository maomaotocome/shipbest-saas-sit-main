import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { useTranslations } from "next-intl";

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

interface RecreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invokerConfig: RecreateTaskInvokerConfig;
  initialRequest: JsonObject;
  demoType: "image" | "video" | "audio";
}

export function RecreateTaskDialog({
  open,
  onOpenChange,
  invokerConfig,
  initialRequest,
  demoType,
}: RecreateTaskDialogProps) {
  const tActions = useTranslations("ai.common.actions");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-hidden border-none">
        <DialogHeader>
          <DialogTitle>{tActions("recreateTaskDialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex h-full max-h-[calc(90vh-10rem)] min-h-0 flex-col">
          {invokerConfig && (
            <UnifiedInvoker
              taskType={invokerConfig.taskType as TaskType}
              metadata={invokerConfig.metadata}
              demoType={demoType}
              demoInterval={5000}
              containerHeight="h-full"
              initialRequest={initialRequest}
              displayMode="page"
              className="min-h-0 flex-1"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
