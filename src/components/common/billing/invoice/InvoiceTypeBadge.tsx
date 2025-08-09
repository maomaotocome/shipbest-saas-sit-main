"use client";

import { Badge } from "@/components/ui/badge";

interface InvoiceTypeBadgeProps {
  isSubscription: boolean;
  isPurchase: boolean;
  subscriptionText: string;
  purchaseText: string;
}

export function InvoiceTypeBadge({
  isSubscription,
  isPurchase,
  subscriptionText,
  purchaseText,
}: InvoiceTypeBadgeProps) {
  if (isSubscription) {
    return <Badge variant="secondary">{subscriptionText}</Badge>;
  }

  if (isPurchase) {
    return <Badge variant="default">{purchaseText}</Badge>;
  }

  // Default case: return a simple dash
  return <>-</>; // Use fragment to return string
}
