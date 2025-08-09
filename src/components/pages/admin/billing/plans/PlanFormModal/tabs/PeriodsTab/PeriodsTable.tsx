import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PeriodType, Prisma } from "@/db/generated/prisma";
import { TrashIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { toArray } from "../utils";
import { PeriodsTableProps } from "./types";
import { shouldShowPeriodValue } from "./utils";

export function PeriodsTable({ formData, allConsumableFeatures, setFormData }: PeriodsTableProps) {
  const t = useTranslations("admin.billing.plans.periodsTab");

  // Helper functions to ensure values are never null
  const getStringValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const getNumberValue = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    return Number(value);
  };

  const includedFeatures = allConsumableFeatures.filter(
    (f) =>
      toArray(formData.planFeatures?.update).some(
        (i) => i.data.featureId === f.id && i.data.isIncluded
      ) ||
      toArray(
        formData.planFeatures?.create as Prisma.PlanFeatureRelationUncheckedCreateWithoutPlanInput[]
      ).some((i) => i.featureId === f.id && i.isIncluded)
  );
  const updatePeriods = toArray(formData.planPeriods?.update).map((p) => p.data);
  const createPeriods = toArray(formData.planPeriods?.create);

  const isLifetime = (periodType: PeriodType) => periodType === PeriodType.LIFETIME;

  const deletePeriod = (id: string, type: "update" | "create") => {
    setFormData((prev) => {
      return {
        ...prev,
        planPeriods: {
          ...prev.planPeriods,
          update:
            type === "update"
              ? toArray(prev.planPeriods?.update).filter((p) => p.data.id !== id)
              : prev.planPeriods?.update,
          create:
            type === "create"
              ? toArray(prev.planPeriods?.create).filter((p) => p.id !== id)
              : prev.planPeriods?.create,
        },
      };
    });
  };

  const setUpdateFeatureAllocationsValue = (
    dataId: string | undefined | null,
    featureId: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      return {
        ...prev,
        planPeriods: {
          ...prev.planPeriods,
          update: toArray(prev.planPeriods?.update).map((p) =>
            p.data.id === dataId
              ? {
                  ...p,
                  data: {
                    ...p.data,
                    featureAllocations: {
                      ...p.data.featureAllocations,
                      update: toArray(
                        p.data.featureAllocations
                          ?.update as Prisma.PlanPeriodFeatureAllocationUpdateWithWhereUniqueWithoutPlanPeriodInput[]
                      ).map((fa) =>
                        fa.data.featureId === featureId
                          ? { ...fa, data: { ...fa.data, quantity: value } }
                          : fa
                      ) as Prisma.PlanPeriodFeatureAllocationUpdateWithWhereUniqueWithoutPlanPeriodInput[],
                    },
                  },
                }
              : p
          ),
        },
      };
    });
  };
  const setCreateFeatureAllocationsValue = (
    dataId: string | undefined | null,
    featureId: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      return {
        ...prev,
        planPeriods: {
          ...prev.planPeriods,
          create: toArray(prev.planPeriods?.create).map((p) =>
            p.id === dataId
              ? {
                  ...p,
                  featureAllocations: {
                    ...p.featureAllocations,
                    create: p.featureAllocations?.create
                      ? (toArray(
                          p.featureAllocations
                            .create as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput[]
                        ).map((fa) =>
                          fa.featureId === featureId ? { ...fa, quantity: value } : fa
                        ) as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput[])
                      : p.featureAllocations?.create,
                  },
                }
              : p
          ),
        },
      };
    });
  };
  const setFieldValue = (
    dataId: string | undefined | null,
    field: string,
    value: string | number
  ) => {
    const update = toArray(formData.planPeriods?.update);
    const create = toArray(formData.planPeriods?.create);
    setFormData((prev) => {
      return {
        ...prev,
        planPeriods: {
          ...prev.planPeriods,
          update: update.map((period) =>
            period.data.id === dataId
              ? { ...period, data: { ...period.data, [field]: value } }
              : period
          ),
          create: create.map((period) =>
            period.id === dataId ? { ...period, [field]: value } : period
          ),
        },
      };
    });
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="left-0 z-10 w-[80px]">{t("actions")}</TableHead>
          <TableHead className="bg-background sticky left-0 z-10 min-w-[150px] whitespace-nowrap">
            {t("period")}
          </TableHead>
          <TableHead className="left-0 z-10 min-w-[300px] whitespace-nowrap">{t("code")}</TableHead>
          <TableHead className="left-0 z-10 min-w-[150px] whitespace-nowrap">
            {t("credits")}
          </TableHead>
          <TableHead className="min-w-[180px] whitespace-nowrap">{t("resetPeriodType")}</TableHead>
          <TableHead className="min-w-[150px] whitespace-nowrap">{t("resetPeriodValue")}</TableHead>
          <TableHead className="min-w-[150px] whitespace-nowrap">{t("price")}</TableHead>
          {includedFeatures.map((feature) => {
            return (
              <TableHead key={feature.id} className="w-[180px] whitespace-nowrap">
                {feature.translations?.[0]?.name} ({feature.translations?.[0]?.unit})
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {updatePeriods.map((period) => (
          <TableRow key={period.id as string}>
            <TableCell className="sticky left-0 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deletePeriod(period.id as string, "update")}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="bg-background sticky left-0 z-10 font-medium whitespace-nowrap">
              {period.periodType as PeriodType}
              {shouldShowPeriodValue(period.periodType as PeriodType)
                ? "-" + (period.periodValue as number)
                : ""}
            </TableCell>
            <TableCell className="left-0 z-10 font-medium whitespace-nowrap">
              <Input
                type="text"
                value={getStringValue(period.periodCode)}
                onChange={(e) => setFieldValue(period.id as string, "periodCode", e.target.value)}
                className="w-full"
              />
            </TableCell>
            <TableCell className="left-0 z-10 font-medium whitespace-nowrap">
              <Input
                type="number"
                value={getNumberValue(period.creditValue)}
                onChange={(e) =>
                  setFieldValue(period.id as string, "creditValue", Number(e.target.value))
                }
                className="w-full"
              />
            </TableCell>
            <TableCell>
              <Select
                value={getStringValue(period.resetPeriodType)}
                onValueChange={(value) =>
                  setFieldValue(period.id as string, "resetPeriodType", value)
                }
                disabled={isLifetime(period.periodType as PeriodType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("resetPeriodType")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PeriodType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={getNumberValue(period.resetPeriodValue)}
                onChange={(e) =>
                  setFieldValue(period.id as string, "resetPeriodValue", Number(e.target.value))
                }
                className="w-full"
                disabled={isLifetime(period.periodType as PeriodType)}
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={getNumberValue(period.price)}
                onChange={(e) =>
                  setFieldValue(period.id as string, "price", Number(e.target.value))
                }
                className="w-full"
              />
            </TableCell>
            {includedFeatures.map((feature) => {
              const allocation =
                toArray(period.featureAllocations?.update).find(
                  (a) => a.data.featureId === feature.id
                )?.data ||
                toArray(
                  period.featureAllocations
                    ?.create as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput[]
                ).find((a) => a.featureId === feature.id);
              if (!allocation) return <TableCell key={feature.id}>-</TableCell>;
              return (
                <TableCell key={feature.id}>
                  <Input
                    type="number"
                    value={getStringValue(allocation.quantity)}
                    onChange={(e) =>
                      setUpdateFeatureAllocationsValue(
                        period.id as string,
                        feature.id,
                        Number(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
        {createPeriods.map((period) => (
          <TableRow key={period.id}>
            <TableCell className="sticky left-0 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deletePeriod(period.id as string, "create")}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="bg-background sticky left-0 z-10 font-medium whitespace-nowrap">
              {period.periodType as PeriodType}
              {shouldShowPeriodValue(period.periodType as PeriodType)
                ? "-" + (period.periodValue as number)
                : ""}
            </TableCell>
            <TableCell className="left-0 z-10 font-medium whitespace-nowrap">
              <Input
                type="text"
                value={getStringValue(period.periodCode)}
                onChange={(e) => setFieldValue(period.id, "periodCode", e.target.value)}
                className="w-full"
              />
            </TableCell>
            <TableCell className="left-0 z-10 font-medium whitespace-nowrap">
              <Input
                type="number"
                value={getNumberValue(period.creditValue)}
                onChange={(e) => setFieldValue(period.id, "creditValue", Number(e.target.value))}
                className="w-full"
              />
            </TableCell>
            <TableCell>
              <Select
                value={getStringValue(period.resetPeriodType)}
                onValueChange={(value) => setFieldValue(period.id, "resetPeriodType", value)}
                disabled={isLifetime(period.periodType as PeriodType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("resetPeriodType")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PeriodType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={getNumberValue(period.resetPeriodValue)}
                onChange={(e) =>
                  setFieldValue(period.id, "resetPeriodValue", Number(e.target.value))
                }
                className="w-full"
                disabled={isLifetime(period.periodType as PeriodType)}
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={getNumberValue(period.price)}
                onChange={(e) => setFieldValue(period.id, "price", Number(e.target.value))}
                className="w-full"
              />
            </TableCell>
            {includedFeatures.map((feature) => {
              const allocation = toArray(
                period.featureAllocations
                  ?.create as Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput
              ).find((a) => a.featureId === feature.id);
              if (!allocation) return <TableCell key={feature.id}>-</TableCell>;
              return (
                <TableCell key={feature.id}>
                  <Input
                    type="number"
                    value={getStringValue(allocation.quantity)}
                    onChange={(e) =>
                      setCreateFeatureAllocationsValue(
                        period.id,
                        feature.id,
                        Number(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
