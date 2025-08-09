"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { CarouselItem, MixCarousel } from "../../mix-carousel";
import { AuthPanel } from "../panel";
interface AuthDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  redirectTo?: string;
  onOpenChange?: (open: boolean) => void;
}

export const defaultVideoDemoItems: CarouselItem[] = [
  {
    url: "https://i.dreamega.io/1.webm",
    type: "video",
  },
  {
    url: "https://i.dreamega.io/2.webm",
    type: "video",
  },
  {
    url: "https://i.dreamega.io/3.webm",
    type: "video",
  },
  {
    url: "https://i.dreamega.io/4.webm",
    type: "video",
  },
  {
    url: "https://i.dreamega.io/5.webm",
    type: "video",
  },
  {
    url: "https://i.dreamega.io/6.webm",
    type: "video",
  },
];

export const AuthDialog = ({ trigger, open, onOpenChange, redirectTo }: AuthDialogProps) => {
  const t = useTranslations("auth");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-full max-w-full overflow-hidden p-0 md:w-7xl">
        <div className="grid h-[600px] grid-cols-1 md:grid-cols-2">
          <div className="h-full">
            <MixCarousel items={defaultVideoDemoItems} className="h-full" title={t("showcase")} />
          </div>
          <div className="flex h-full flex-col">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>{t("authentication")}</DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex-1">
              <AuthPanel redirectTo={redirectTo} onOpenChange={onOpenChange} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
