"use client";

import Pagination from "@/components/common/pagination";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PurchaseTable } from "./components/PurchaseTable";
import { usePurchases } from "./hooks/usePurchases";
import { useRefund } from "./hooks/useRefund";

export default function PurchasesPage() {
  const t = useTranslations("admin.billing.purchases");
  const [page, setPage] = useState(1);
  const [status] = useState<string>("all");
  const pageSize = 10;

  const {
    data: purchaseData,
    isLoading,
    error,
  } = usePurchases({
    page,
    pageSize,
    status,
  });

  const refundMutation = useRefund();

  const purchases = purchaseData?.items || [];
  const totalPages = purchaseData?.totalPages ?? 0;

  const handleRefund = async (purchaseId: string) => {
    if (!confirm(t("confirmRefund"))) return;

    try {
      await refundMutation.mutateAsync({
        purchaseId,
        reason: "Admin refund",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to process refund");
    }
  };

  if (error) {
    return <div className="text-red-500">{error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <PurchaseTable purchases={purchases} onRefund={handleRefund} loading={isLoading} />

      {totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
      )}
    </div>
  );
}
