import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FeatureType, Prisma } from "@/db/generated/prisma";
import { FeatureGetPayload } from "@/types/billing";
import { useTranslations } from "next-intl";
import { toArray } from "./utils";

interface FeaturesTabProps {
  formData: Prisma.PlanUpdateInput;
  setFormData: React.Dispatch<React.SetStateAction<Prisma.PlanUpdateInput>>;
  features: FeatureGetPayload[];
  isLoading?: boolean;
}

type FeatureRelation = Prisma.PlanFeatureRelationUncheckedCreateWithoutPlanInput;

export default function FeaturesTab({
  formData,
  setFormData,
  features,
  isLoading = false,
}: FeaturesTabProps) {
  const t = useTranslations("admin.billing.plans.featuresTab");

  /**
   * Handles the change of feature reference status in the plan.
   * When a feature is referenced:
   * - Adds it to the planFeatures.create array with default values
   * - Removes it from planFeatures.update array
   * - Removes it from planFeatures.delete array
   * - Adds it to featureAllocations.create array in planPeriods with default quantity
   * When a feature is unreferenced:
   * - Removes it from planFeatures.create array
   * - Removes it from planFeatures.update array
   * - Adds it to planFeatures.delete array
   * - Removes it from featureAllocations in planPeriods
   *
   * @param featureId - The ID of the feature being modified
   * @param value - Boolean indicating whether the feature should be referenced
   */
  const onReferencedChange = (featureId: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      planFeatures: {
        ...prev.planFeatures,
        create: [
          ...toArray(prev.planFeatures?.create as FeatureRelation[]).filter(
            (f) => f.featureId !== featureId
          ),
          ...(value ? [{ featureId, isIncluded: false, sortOrder: 0 }] : []),
        ],
        update: [
          ...toArray(prev.planFeatures?.update).filter((f) => f.data?.featureId !== featureId),
        ],
        delete: [
          ...toArray(prev.planFeatures?.delete),
          ...(value
            ? []
            : toArray(prev.planFeatures?.update)
                .filter((f) => f.data.featureId === featureId)
                .map((f) => ({
                  id: f.where?.id,
                }))),
        ],
      },
      planPeriods: {
        ...prev.planPeriods,
        create: [
          ...toArray(prev.planPeriods?.create).map((p) => ({
            ...p,
            featureAllocations: {
              ...p.featureAllocations,
              create: [
                ...toArray(
                  p.featureAllocations
                    ?.create as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput[]
                ).filter((f) => f.featureId !== featureId),
                ...(value ? [{ featureId, quantity: 0 }] : []),
              ],
            },
          })),
        ],
        update: [
          ...toArray(prev.planPeriods?.update).map((p) => ({
            ...p,
            data: {
              ...p.data,
              featureAllocations: {
                ...p.data.featureAllocations,
                create: [
                  ...toArray(
                    p.data.featureAllocations
                      ?.create as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput[]
                  ).filter((f) => f.featureId !== featureId),
                  ...(value ? [{ featureId, quantity: 0 }] : []),
                ],
                delete: [
                  ...toArray(p.data.featureAllocations?.delete),
                  ...toArray(p.data.featureAllocations?.update)
                    .filter((f) => f.data.featureId === featureId)
                    .map((f) => ({
                      id: f.where?.id,
                    })),
                ],
                update: [
                  ...toArray(p.data.featureAllocations?.update).filter(
                    (f) => f.data.featureId !== featureId
                  ),
                ],
              },
            },
          })),
        ],
      },
    }));
  };

  // Get all features (including those in create and update arrays)
  const getAllFeatures = () => {
    const updateFeatures = toArray(formData.planFeatures?.update).map((f) => f.data);
    const createFeatures = toArray(formData.planFeatures?.create as FeatureRelation[]);
    return [...updateFeatures, ...createFeatures] as FeatureRelation[];
  };

  const isConsumableFeature = (featureId: string) => {
    return features.find((f) => f.id === featureId)?.featureType === FeatureType.CONSUMABLE;
  };

  /**
   * Updates a specific feature's property in the plan.
   * Handles updates for both planFeatures and planPeriods arrays.
   * For planFeatures:
   * - Updates the specified field in both update and create arrays
   * For planPeriods (only when updating isIncluded for consumable features):
   * - Updates featureAllocations in both update and create arrays
   * - Handles deletion of existing allocations
   * - Creates new allocations with default quantity
   *
   * @param featureId - The ID of the feature being updated
   * @param field - The property name to update (e.g., 'isIncluded', 'isPrimary', 'limit')
   * @param value - The new value for the specified field
   */
  const updateFeature = (featureId: string, field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      planFeatures: {
        ...prev.planFeatures,
        update: toArray(prev.planFeatures?.update).map((f) =>
          f.data.featureId === featureId ? { ...f, data: { ...f.data, [field]: value } } : f
        ),
        create: toArray(prev.planFeatures?.create as FeatureRelation[]).map((f) =>
          f.featureId === featureId ? { ...f, [field]: value } : f
        ),
      },
      planPeriods:
        field === "isIncluded" && isConsumableFeature(featureId)
          ? {
              ...prev.planPeriods,
              update: toArray(prev.planPeriods?.update).map((p) => ({
                ...p,
                data: {
                  ...p.data,
                  featureAllocations: {
                    ...p.data.featureAllocations,
                    update: toArray(p.data.featureAllocations?.update).filter(
                      (f) => f.data.featureId !== featureId
                    ),
                    delete: [
                      ...toArray(p.data.featureAllocations?.delete).filter(
                        (f) => f.featureId !== featureId
                      ),
                      ...toArray(p.data.featureAllocations?.update)
                        .filter((f) => f.data.featureId === featureId)
                        .map((f) => ({
                          id: f.where?.id,
                        })),
                    ],
                    create: [
                      ...toArray(
                        p.data.featureAllocations
                          ?.create as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput[]
                      ).filter((f) => f.featureId !== featureId),
                      ...(value ? [{ featureId, quantity: 0 }] : []),
                    ],
                  },
                },
              })),
              create: toArray(prev.planPeriods?.create).map((p) => ({
                ...p,
                featureAllocations: {
                  ...p.featureAllocations,
                  create: [
                    ...toArray(
                      p.featureAllocations
                        ?.create as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput[]
                    ).filter((f) => f.featureId !== featureId),
                    ...(value ? [{ featureId, quantity: 0 }] : []),
                  ],
                },
              })),
            }
          : { ...prev.planPeriods },
    }));
  };

  const isFeatureReferenced = (featureId: string): boolean => {
    const allFeatures = getAllFeatures();
    return allFeatures.some((f) => f.featureId === featureId);
  };
  // Check if a feature is included in the plan
  const isFeatureIncluded = (featureId: string): boolean => {
    const allFeatures = getAllFeatures();
    return allFeatures.some((f) => f.featureId === featureId && f.isIncluded);
  };

  // Get the feature limit
  const getFeatureLimit = (featureId: string): string => {
    const allFeatures = getAllFeatures();
    const feature = allFeatures.find((f) => f.featureId === featureId);
    return feature?.limit !== null && feature?.limit !== undefined ? String(feature.limit) : "";
  };

  // Check if a feature is a primary feature
  const isFeaturePrimary = (featureId: string): boolean => {
    const allFeatures = getAllFeatures();
    return allFeatures.some((f) => f.featureId === featureId && f.isPrimary);
  };

  if (isLoading) {
    return <div></div>;
  }

  if (features.length === 0) {
    return <div>{t("noAvailableFeatures")}</div>;
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-background sticky left-0 z-10 w-[250px]">
                  {t("feature")}
                </TableHead>
                <TableHead className="w-[120px] text-center">{t("referenced")}</TableHead>
                <TableHead className="w-[120px] text-center">{t("included")}</TableHead>
                <TableHead className="w-[120px] text-center">{t("primary")}</TableHead>
                <TableHead className="w-[200px] text-center">{t("limit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => {
                const featureName = feature.translations?.[0]?.name || feature.code;
                const featureDescription = feature.translations?.[0]?.description;
                const featureUnit = feature.translations?.[0]?.unit;

                return (
                  <TableRow key={feature.id}>
                    <TableCell className="bg-background sticky left-0 z-10">
                      <div>
                        <div className="font-medium">{featureName}</div>
                        {featureDescription && (
                          <div className="text-muted-foreground text-sm">{featureDescription}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          id={`referenced-${feature.id}`}
                          checked={isFeatureReferenced(feature.id)}
                          onCheckedChange={(value) =>
                            onReferencedChange(feature.id, Boolean(value))
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch
                          id={`feature-${feature.id}`}
                          checked={isFeatureIncluded(feature.id)}
                          onCheckedChange={(value) =>
                            updateFeature(feature.id, "isIncluded", value)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          id={`primary-${feature.id}`}
                          checked={isFeaturePrimary(feature.id)}
                          onCheckedChange={(value) =>
                            updateFeature(feature.id, "isPrimary", !!value)
                          }
                          disabled={!isFeatureIncluded(feature.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {feature.featureType === FeatureType.ALLOCATABLE ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`limit-${feature.id}`}
                            type="number"
                            value={getFeatureLimit(feature.id)}
                            onChange={(e) =>
                              updateFeature(
                                feature.id,
                                "limit",
                                e.target.value ? parseInt(e.target.value) : 0
                              )
                            }
                            disabled={!isFeatureIncluded(feature.id)}
                            placeholder={t("limitPlaceholder")}
                            className="w-full"
                          />
                          {featureUnit && (
                            <span className="text-muted-foreground text-sm whitespace-nowrap">
                              {featureUnit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">{t("notApplicable")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
