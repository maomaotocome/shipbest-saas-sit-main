import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface CreditSummary {
  availableAmount: number;
  pendingAmount: number;
}

interface CreditsHeaderProps {
  summary?: CreditSummary;
}

export function CreditsHeader({ summary }: CreditsHeaderProps) {
  const t = useTranslations("user.credits");

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("availableCredits")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary?.availableAmount ? summary.availableAmount : 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("pendingCredits")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary?.pendingAmount ? summary.pendingAmount : 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
