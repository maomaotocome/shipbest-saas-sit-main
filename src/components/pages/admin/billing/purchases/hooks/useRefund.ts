import { refundPurchase } from "@/actions/admin/billing/purchases/refund";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

interface RefundParams {
  purchaseId: string;
  reason: string;
}

export function useRefund() {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.purchases");

  return useMutation({
    mutationFn: ({ purchaseId, reason }: RefundParams) => refundPurchase(purchaseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success(t("refundSuccess"));
    },
    onError: (error) => {
      console.error("Refund error:", error);
      toast.error(t("refundError"));
    },
  });
}
