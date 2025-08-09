import { Invoice } from "@/db/generated/prisma";
import { formatDateTimeI18n } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl"; // Import useLocale
// Import the new type from the action file
import {
  FinalInvoicePayload,
  PurchaseObject, // Import object type
  SubscriptionPeriodObject, // Import object type
} from "@/actions/admin/billing/invoice";
import { InvoiceTypeBadge } from "@/components/common/billing/invoice/InvoiceTypeBadge"; // Import the new component
import { Button } from "@/components/ui/button";
import { ExternalLink, FileDown } from "lucide-react";

// Helper function to format currency (simple version for now)
const formatCurrency = (amount: number | null | undefined, currency: string | null | undefined) => {
  if (amount === null || amount === undefined || !currency) {
    return "N/A";
  }
  // Basic formatting, consider a more robust library for real applications
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
};

// Helper function to format date using internationalization
const formatDate = (date: Date | string | null | undefined, locale: string) => {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return formatDateTimeI18n(dateObj, locale);
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return "Invalid Date";
  }
};

// Helper function to extract plan name based on locale
const getPlanName = (item: FinalInvoicePayload, locale: string): string => {
  let translations: { nickname: string; locale: string }[] | undefined | null;

  // Access subscriptionPeriod directly (it's an object or null)
  const subPeriod = item.subscriptionPeriod as SubscriptionPeriodObject | null; // Add assertion
  // Access purchase directly (it's an object or null)
  const purch = item.purchase as PurchaseObject | null; // Add assertion

  // Check subscription first
  if (subPeriod?.subscription?.planPeriod?.plan?.translations) {
    translations = subPeriod.subscription.planPeriod.plan.translations;
  } else if (purch?.planPeriod?.plan?.translations) {
    translations = purch.planPeriod.plan.translations;
  }

  if (!translations || translations.length === 0) {
    return "N/A";
  }

  const specificLocaleTranslation = translations.find((t) => t && t.locale === locale);
  return specificLocaleTranslation?.nickname ?? translations[0]?.nickname ?? "N/A";
};

// Create a hook to define columns with translations
export const useColumns = () => {
  const t = useTranslations("admin.billing.invoice");
  const locale = useLocale();
  return [
    {
      accessorKey: "number",
      header: t("columns.invoiceNumber"),
    },
    {
      accessorKey: "billingUser.user.email",
      header: t("columns.customerEmail"),
      cell: (row: FinalInvoicePayload) => row.billingUser?.user?.email ?? "N/A",
    },
    {
      accessorKey: "total",
      header: t("columns.amount"),
      cell: (row: FinalInvoicePayload) => formatCurrency(row.total, row.currency),
    },
    {
      header: t("columns.type"),
      accessorKey: "type",
      cell: (row: FinalInvoicePayload) => {
        const isSubscription = !!row.subscriptionPeriod;
        const isPurchase = !!row.purchase;
        return (
          <InvoiceTypeBadge
            isSubscription={isSubscription}
            isPurchase={isPurchase}
            subscriptionText={t("types.subscription")}
            purchaseText={t("types.purchase")}
          />
        );
      },
    },
    {
      header: t("columns.planName"),
      accessorKey: "planName",
      cell: (row: FinalInvoicePayload) => {
        return getPlanName(row, locale);
      },
    },
    {
      header: t("columns.periodNumber"),
      accessorKey: "periodNumber",
      cell: (row: FinalInvoicePayload) => {
        // Access periodNumber directly from the subscriptionPeriod object
        const subPeriod = row.subscriptionPeriod as SubscriptionPeriodObject | null; // Add assertion
        return subPeriod?.periodNumber ?? "N/A";
      },
    },
    {
      accessorKey: "issueDate",
      header: t("columns.issueDate"),
      cell: (row: FinalInvoicePayload) => formatDate(row.issueDate, locale),
    },
    {
      accessorKey: "paidAt",
      header: t("columns.paidDate"),
      cell: (row: FinalInvoicePayload) => formatDate(row.paidAt, locale),
    },
    {
      header: t("columns.dueDate"),
      accessorKey: "dueDate",
      cell: (row: Invoice) => formatDate(row.dueDate, locale),
    },
    {
      accessorKey: "actions",
      header: t("columns.actions"),
      cell: (row: FinalInvoicePayload) => (
        <>
          {row.invoicePdfUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(row.invoicePdfUrl!, "_blank")}
            >
              <FileDown className="mr-2 h-4 w-4" />
              {t("downloadPdf")}
            </Button>
          )}
          {row.invoiceUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(row.invoiceUrl!, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("viewOnline")}
            </Button>
          )}
        </>
      ),
    },
  ];
};
