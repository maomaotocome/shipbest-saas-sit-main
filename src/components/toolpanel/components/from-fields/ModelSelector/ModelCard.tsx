import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseModel } from "@/conifg/aigc/types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import Image from "next/image";

export interface ModelCardProps {
  model: BaseModel;
  isSelected: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export function ModelCard({ model, isSelected, onClick, className }: ModelCardProps) {
  const ModelInfo = () => (
    <div className="space-y-2">
      <div className="text-xs">
        <div>{model.company}</div>
        <p className="text-foreground">{model.description}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {model.tags.map((tag) => (
          <span
            key={tag}
            className="bg-accent/20 text-foreground rounded-full px-1.5 py-0.5 text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <Card
      className={cn(
        "hover:bg-accent/10 relative cursor-pointer overflow-hidden rounded-md border-none bg-white/5 p-1 transition-all dark:bg-black/5",
        isSelected && "border-primary border bg-white/50 outline outline-1 dark:bg-black/50",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-1">
        <Image src={model.icon} width={16} height={16} alt={model.name} className="rounded-lg" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium">{model.name}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-70">
                  <ModelInfo />
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="md:hidden">
              <Info className="text-muted-foreground h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
