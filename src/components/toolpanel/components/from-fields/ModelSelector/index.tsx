import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BaseModel } from "@/conifg/aigc/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ModelCard } from "./ModelCard";

interface ModelSelectorProps {
  models: BaseModel[];
  selectedModels: BaseModel[];
  setSelectedModels: (models: BaseModel[]) => void;
  required?: boolean;
  collapsible?: boolean;
  className?: string;
  defaultCollapsed?: boolean;
}

export function ModelsSelector({
  models,
  selectedModels,
  setSelectedModels,
  required = true,
  collapsible = false,
  className,
  defaultCollapsed = false,
}: ModelSelectorProps) {
  const t = useTranslations("ai.common");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleModelClick = (model: BaseModel) => {
    // Single select mode: if the clicked item is currently selected, cancel selection; otherwise, replace with the new item
    const isCurrentlySelected =
      selectedModels.length === 1 && selectedModels[0].code === model.code;
    if (isCurrentlySelected) {
      // cancel selection
      setSelectedModels([]);
    } else {
      // replace with the new item
      setSelectedModels([model]);
    }
  };

  // when no model is selected, force to show the collapsed state
  const shouldShowCollapsed = isCollapsed && selectedModels.length > 0;
  // only allow collapse when there is a selected model
  const canCollapse = collapsible && selectedModels.length > 0;

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl p-2 shadow-md shadow-black/15 dark:shadow-white/20",
        className
      )}
      onClick={canCollapse ? () => setIsCollapsed(!isCollapsed) : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Cpu className="text-primary h-4 w-4 shrink-0" />
          <Label htmlFor="model_selector" className="block text-left text-sm">
            {t("model")}
            {required && <span className="text-red-500">*</span>}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          {/* Show selected models when collapsed */}
          {shouldShowCollapsed && (
            <div className="text-muted-foreground flex items-center gap-1 rounded-full border-none bg-white/30 px-2 py-1 text-sm dark:bg-black/5">
              <span className="max-w-64 truncate">{selectedModels[0].name}</span>
            </div>
          )}

          {canCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {!shouldShowCollapsed && (
        <>
          {/* Mobile view - dialog trigger */}
          <div className="mb-2 flex justify-end md:hidden">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {t("selectModel")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className="space-y-2">
                  <div className="mb-2">
                    <span className="text-base font-semibold">{t("selectModelTitle")}</span>
                  </div>
                  {models.map((model) => (
                    <ModelCard
                      key={model.name}
                      model={model}
                      isSelected={selectedModels.some(
                        (selectedModel) => selectedModel.code === model.code
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModelClick(model);
                        setIsDialogOpen(false);
                      }}
                      className="w-full"
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Desktop view - grid layout */}
          <div className="hidden grid-cols-2 gap-1.5 py-1 md:grid">
            {models.map((model) => (
              <ModelCard
                key={model.code}
                model={model}
                isSelected={selectedModels.some(
                  (selectedModel) => selectedModel.code === model.code
                )}
                onClick={() => {
                  // for prevent parent click event to collapse the model selector
                  handleModelClick(model);
                }}
              />
            ))}
          </div>

          {/* Mobile view - horizontal scroll */}
          <ScrollArea className="w-full whitespace-nowrap md:hidden">
            <div className="flex w-max space-x-1.5 p-2">
              {models.map((model) => (
                <ModelCard
                  key={model.code}
                  model={model}
                  isSelected={selectedModels.some(
                    (selectedModel) => selectedModel.code === model.code
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModelClick(model);
                  }}
                  className="w-56"
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      )}
    </div>
  );
}
