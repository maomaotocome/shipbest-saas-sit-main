import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FeatureGetPayload } from "@/types/billing";
import { useTranslations } from "next-intl";

interface FeaturesModalProps {
  open: boolean;
  onClose: () => void;
  features: FeatureGetPayload[];
  onEditFeature: (id: string) => void;
  onAddFeature: () => void;
}

export function FeaturesModal({
  open,
  onClose,
  features,
  onEditFeature,
  onAddFeature,
}: FeaturesModalProps) {
  const t = useTranslations("admin.billing.plans");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("manageFeatures")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={onAddFeature} className="w-full">
            {t("addFeature")}
          </Button>
          {features.length === 0 ? (
            <div className="rounded-md border p-4">
              <p>{t("noFeaturesDefined")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {features.map((feature: FeatureGetPayload) => (
                <div key={feature.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">
                      {feature.translations?.[0]?.name || feature.code}
                    </h3>
                    <Badge>{feature.featureType}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {feature.translations?.[0]?.description}
                  </p>
                  {feature.translations?.[0]?.unit && (
                    <p className="mt-1 text-sm">Unit: {feature.translations?.[0]?.unit}</p>
                  )}
                  <Button onClick={() => onEditFeature(feature.id)} className="mt-2">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
