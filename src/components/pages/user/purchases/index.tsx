"use client";

import { getPurchases } from "@/actions/user/purchases/get";
import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { formatDateI18n, translateEnum } from "@/lib/utils";
import { PurchaseWithDetail } from "@/types/billing/purchases";
import { PaginatedResponse } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function PurchasesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const t = useTranslations("user.purchases");
  const locale = useLocale();

  const { data: purchaseData, isLoading } = useQuery<PaginatedResponse<PurchaseWithDetail>>({
    queryKey: ["user-purchases", page, pageSize],
    queryFn: () => getPurchases({ page, pageSize }),
  });

  const purchases = purchaseData?.items || [];
  const totalPages = purchaseData?.totalPages ?? 0;

  const getPlanName = (purchase: PurchaseWithDetail): string => {
    const translations = purchase.planPeriod?.plan?.translations;
    if (!translations || translations.length === 0) {
      return "N/A";
    }
    const specificLocaleTranslation = translations.find((t) => t.locale === locale);
    return specificLocaleTranslation?.nickname ?? translations[0]?.nickname ?? "N/A";
  };

  const columns = [
    {
      header: t("planName"),
      accessorKey: "planName",
      cell: (row: PurchaseWithDetail) => getPlanName(row),
    },
    {
      header: t("billingCycle"),
      accessorKey: "billingCycle",
      cell: (row: PurchaseWithDetail) =>
        row.planPeriod ? (
          <PlanPeriodFormatText
            type={row.planPeriod.periodType}
            value={row.planPeriod.periodValue}
          />
        ) : (
          "N/A"
        ),
    },
    {
      header: t("purchaseStatus"),
      accessorKey: "status",
      cell: (row: PurchaseWithDetail) => translateEnum(t, "purchaseStatus", row.status),
    },
    {
      header: t("invoiceStatus"),
      accessorKey: "invoice.status",
      cell: (row: PurchaseWithDetail) =>
        row.invoice?.status ? translateEnum(t, "invoiceStatus", row.invoice.status) : "N/A",
    },
    {
      header: t("amount"),
      accessorKey: "invoice.total",
      cell: (row: PurchaseWithDetail) =>
        row.invoice ? `${row.invoice.currency} ${(row.invoice.total / 100).toFixed(2)}` : "N/A",
    },
    {
      header: t("purchaseDate"),
      accessorKey: "purchaseDate",
      cell: (row: PurchaseWithDetail) => formatDateI18n(new Date(row.purchaseDate), locale),
    },
    {
      header: t("orderId"),
      accessorKey: "providerOrderId",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <DataTable columns={columns} data={purchases} loading={isLoading} />
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
