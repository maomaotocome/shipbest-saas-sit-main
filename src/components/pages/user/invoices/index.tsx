"use client";

import { getInvoices } from "@/actions/user/invoices/get";
import { InvoiceTypeBadge } from "@/components/common/billing/invoice/InvoiceTypeBadge";
import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import {
  type UserInvoiceDetail,
  UserPurchaseObject,
  UserSubscriptionPeriodObject,
} from "@/db/billing/invoices/getUserInvoices";
import { Invoice } from "@/db/generated/prisma";
import { formatDateI18n } from "@/lib/utils";
import { PaginatedResponse } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function InvoicePage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const t = useTranslations("user.invoices");
  const locale = useLocale();

  const { data: invoiceData, isLoading } = useQuery<PaginatedResponse<UserInvoiceDetail>>({
    queryKey: ["user-invoices", page, pageSize],
    queryFn: () => getInvoices({ page, pageSize }),
  });

  const invoices = invoiceData?.items || [];
  const totalPages = invoiceData?.totalPages ?? 0;

  const columns = [
    {
      header: t("number"),
      accessorKey: "number",
    },
    {
      header: t("type"),
      accessorKey: "type",
      cell: (row: UserInvoiceDetail) => {
        const isSubscription = !!row.subscriptionPeriod;
        const isPurchase = !!row.purchase;
        return (
          <InvoiceTypeBadge
            isSubscription={isSubscription}
            isPurchase={isPurchase}
            subscriptionText={t("typeSubscription")}
            purchaseText={t("typePurchase")}
          />
        );
      },
    },
    {
      header: t("planName"),
      accessorKey: "planName",
      cell: (row: UserInvoiceDetail) => {
        const subPeriod = row.subscriptionPeriod as UserSubscriptionPeriodObject | null;
        const purch = row.purchase as UserPurchaseObject | null;
        const plan =
          subPeriod?.subscription?.planPeriod?.plan?.translations?.[0]?.nickname ||
          purch?.planPeriod?.plan?.translations?.[0]?.nickname;
        return plan || "-";
      },
    },
    {
      header: t("startDate"),
      accessorKey: "startDate",
      cell: (row: UserInvoiceDetail) => {
        const subPeriod = row.subscriptionPeriod as UserSubscriptionPeriodObject | null;
        const purch = row.purchase as UserPurchaseObject | null;
        const date = subPeriod?.startDate || purch?.purchaseDate;
        return date ? formatDateI18n(new Date(date), locale) : "-";
      },
    },
    {
      header: t("billingPeriod"),
      accessorKey: "billingPeriod",
      cell: (row: UserInvoiceDetail) => {
        const subPeriod = row.subscriptionPeriod as UserSubscriptionPeriodObject | null;
        const purch = row.purchase as UserPurchaseObject | null;
        const planPeriod = subPeriod?.subscription?.planPeriod || purch?.planPeriod;
        if (!planPeriod) return "-";
        return <PlanPeriodFormatText type={planPeriod.periodType} value={planPeriod.periodValue} />;
      },
    },
    {
      header: t("resetPeriod"),
      accessorKey: "resetPeriod",
      cell: (row: UserInvoiceDetail) => {
        const subPeriod = row.subscriptionPeriod as UserSubscriptionPeriodObject | null;
        const purch = row.purchase as UserPurchaseObject | null;
        const planPeriod = subPeriod?.subscription?.planPeriod || purch?.planPeriod;
        if (!planPeriod?.resetPeriodType) return "-";
        return (
          <PlanPeriodFormatText
            type={planPeriod.resetPeriodType}
            value={planPeriod.resetPeriodValue}
          />
        );
      },
    },
    {
      header: t("status"),
      accessorKey: "status",
    },
    {
      header: t("issueDate"),
      accessorKey: "issueDate",
      cell: (row: Invoice) => formatDateI18n(new Date(row.issueDate), locale),
    },
    {
      header: t("dueDate"),
      accessorKey: "dueDate",
      cell: (row: Invoice) => formatDateI18n(new Date(row.dueDate), locale),
    },
    {
      header: t("total"),
      accessorKey: "total",
      cell: (row: Invoice) => `${row.currency} ${(row.total / 100).toFixed(2)}`,
    },
    {
      header: t("paidAt"),
      accessorKey: "paidAt",
      cell: (row: UserInvoiceDetail) =>
        row.paidAt ? formatDateI18n(new Date(row.paidAt), locale) : "-",
    },
  ];

  const customActions = (row: UserInvoiceDetail) => (
    <>
      {row.invoicePdfUrl && (
        <Button variant="ghost" size="sm" onClick={() => window.open(row.invoicePdfUrl!, "_blank")}>
          <FileDown className="mr-2 h-4 w-4" />
          {t("downloadPdf")}
        </Button>
      )}
      {row.invoiceUrl && (
        <Button variant="ghost" size="sm" onClick={() => window.open(row.invoiceUrl!, "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          {t("viewOnline")}
        </Button>
      )}
    </>
  );

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        customActions={customActions}
      />
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
