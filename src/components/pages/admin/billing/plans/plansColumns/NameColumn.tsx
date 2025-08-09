import { PlanGetPayloadWithDetail } from "@/types/billing";
import { useTranslations } from "next-intl";

export const NameColumn = (row: PlanGetPayloadWithDetail) => {
  const t = useTranslations("admin.billing.plans");

  return (
    <div className="space-y-1">
      {row.translations && row.translations.length > 0 ? (
        row.translations.map((trans) => <div key={trans.id}>{trans.nickname}</div>)
      ) : row.translations[0] ? (
        <div>
          <span className="font-medium">{row.translations[0].locale}:</span>{" "}
          {row.translations[0].nickname}
        </div>
      ) : (
        t("noTranslations")
      )}
    </div>
  );
};
