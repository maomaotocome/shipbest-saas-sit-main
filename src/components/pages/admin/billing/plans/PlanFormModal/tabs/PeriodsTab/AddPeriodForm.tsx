import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PeriodType } from "@/db/generated/prisma";
import { PlusIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { AddPeriodFormProps } from "./types";
import { shouldShowPeriodValue } from "./utils";

export function AddPeriodForm({
  newPeriodType,
  setNewPeriodType,
  newPeriodValue,
  setNewPeriodValue,
  onAddPeriod,
}: AddPeriodFormProps) {
  const t = useTranslations("admin.billing.plans.periodsTab");

  return (
    <div className="mt-6 flex items-end gap-4 rounded-md border p-4">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">{t("periodType")}</label>
        <Select
          value={newPeriodType}
          onValueChange={(value) => setNewPeriodType(value as PeriodType)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectPeriodType")} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PeriodType).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {shouldShowPeriodValue(newPeriodType) && (
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">{t("periodValue")}</label>
          <Input
            type="number"
            value={newPeriodValue}
            onChange={(e) => setNewPeriodValue(parseInt(e.target.value) || 1)}
            min={1}
          />
        </div>
      )}

      <Button onClick={onAddPeriod}>
        <PlusIcon className="mr-2 h-4 w-4" />
        {t("addPeriod")}
      </Button>
    </div>
  );
}
