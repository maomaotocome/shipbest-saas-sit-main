import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditGrant } from "@/db/generated/prisma";
import { formatDateI18n, formatDateTimeI18n, translateEnum } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export interface CreditGrantWithDetails extends CreditGrant {
  transactionDetails: {
    transaction: { id: string; createdAt: Date };
    amount: number;
  }[];
}

interface CreditsGrantsProps {
  grants?: CreditGrantWithDetails[];
  loading?: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function CreditsGrants({
  grants,
  loading,
  totalPages,
  currentPage,
  onPageChange,
}: CreditsGrantsProps) {
  const [selectedGrant, setSelectedGrant] = useState<CreditGrantWithDetails | null>(null);
  const t = useTranslations("user.credits");
  const locale = useLocale();

  const grantColumns = [
    {
      header: t("amount"),
      accessorKey: "amount",
      cell: (row: CreditGrantWithDetails) => row.amount,
    },
    {
      header: t("remainingAmount"),
      accessorKey: "remainingAmount",
      cell: (row: CreditGrantWithDetails) => row.remainingAmount,
    },
    {
      header: t("availableAmount"),
      accessorKey: "availableAmount",
      cell: (row: CreditGrantWithDetails) => row.availableAmount,
    },
    {
      header: t("grantDate"),
      accessorKey: "createdAt",
      cell: (row: CreditGrantWithDetails) => formatDateI18n(new Date(row.createdAt), locale),
    },
    {
      header: t("validFrom"),
      accessorKey: "validFrom",
      cell: (row: CreditGrantWithDetails) => formatDateI18n(new Date(row.validFrom), locale),
    },
    {
      header: t("validUntil"),
      accessorKey: "validUntil",
      cell: (row: CreditGrantWithDetails) =>
        row.validUntil ? formatDateI18n(new Date(row.validUntil), locale) : "-",
    },
    {
      header: t("source"),
      accessorKey: "source",
      cell: (row: CreditGrantWithDetails) => translateEnum(t, "creditSource", row.source),
    },
    {
      header: t("actions"),
      accessorKey: "id",
      cell: (row: CreditGrantWithDetails) => (
        <button onClick={() => setSelectedGrant(row)}>{t("viewDetails")}</button>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={grantColumns} data={grants || []} loading={loading} />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <Dialog open={!!selectedGrant} onOpenChange={() => setSelectedGrant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("grantDetails")}</DialogTitle>
          </DialogHeader>
          {selectedGrant && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{t("transactionDetails")}</h3>
                <div className="mt-2 space-y-2">
                  {selectedGrant.transactionDetails.map((detail) => (
                    <div key={detail.transaction.id} className="flex justify-between">
                      <span>
                        {formatDateTimeI18n(new Date(detail.transaction.createdAt), locale)}
                      </span>
                      <span>{detail.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
