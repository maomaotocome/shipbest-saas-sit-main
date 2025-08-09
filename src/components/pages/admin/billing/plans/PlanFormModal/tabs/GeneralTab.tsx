import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BillingScheme, PlanStatus, Prisma } from "@/db/generated/prisma";
import { useTranslations } from "next-intl";

interface GeneralTabProps {
  formData: Prisma.PlanUpdateInput;
  updateField: (field: string, value: string | number | boolean | null) => void;
  isEdit: boolean;
}

export default function GeneralTab({ formData, updateField, isEdit }: GeneralTabProps) {
  const t = useTranslations("admin.billing.plans.generalTab");

  // Helper function to ensure string values are never null
  const getStringValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  // Helper function to ensure number values are never null
  const getNumberValue = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    return Number(value);
  };

  // Helper function to format date for input
  const getDateValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }
    if (typeof value === "string") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">{t("code")}</Label>
          <Input
            id="code"
            value={getStringValue(formData.code)}
            onChange={(e) => updateField("code", e.target.value)}
            placeholder={t("codePlaceholder")}
            disabled={isEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t("status")}</Label>
          <Select
            value={getStringValue(formData.status)}
            onValueChange={(value) => updateField("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PlanStatus.ACTIVE}>{t("PlanStatus.active")}</SelectItem>
              <SelectItem value={PlanStatus.DEPRECATED}>{t("PlanStatus.deprecated")}</SelectItem>
              <SelectItem value={PlanStatus.ARCHIVED}>{t("PlanStatus.archived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingScheme">{t("billingScheme")}</Label>
          <Select
            value={getStringValue(formData.billingScheme)}
            onValueChange={(value) => updateField("billingScheme", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("billingSchemePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BillingScheme.CREDIT_BASED}>
                {t("BillingScheme.creditBased")}
              </SelectItem>
              <SelectItem value={BillingScheme.TIME_BASED}>
                {t("BillingScheme.timeBased")}
              </SelectItem>
              <SelectItem value={BillingScheme.HYBRID}>{t("BillingScheme.hybrid")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">{t("sortOrder")}</Label>
          <Input
            id="sortOrder"
            type="number"
            value={getNumberValue(formData.sortOrder)}
            onChange={(e) => updateField("sortOrder", parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validFrom">{t("validFrom")}</Label>
          <Input
            id="validFrom"
            type="date"
            value={getDateValue(formData.validFrom)}
            onChange={(e) => updateField("validFrom", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">{t("validUntil")}</Label>
          <Input
            id="validUntil"
            type="date"
            value={getDateValue(formData.validUntil)}
            onChange={(e) => updateField("validUntil", e.target.value || null)}
          />
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="isPopular"
            checked={Boolean(formData.isPopular)}
            onCheckedChange={(value) => updateField("isPopular", value)}
          />
          <Label htmlFor="isPopular">{t("isPopular")}</Label>
        </div>
      </div>
    </div>
  );
}
