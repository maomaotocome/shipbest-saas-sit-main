import { BillingScheme, InvoiceStatus, Prisma } from "@/db/generated/prisma";
import type { Stripe } from "stripe";

function convertInvoiceStatus(stripeStatus: string | null): InvoiceStatus {
  if (!stripeStatus) return InvoiceStatus.DRAFT;

  switch (stripeStatus) {
    case "draft":
      return InvoiceStatus.DRAFT;
    case "open":
      return InvoiceStatus.OPEN;
    case "paid":
      return InvoiceStatus.PAID;
    case "void":
      return InvoiceStatus.VOID;
    case "uncollectible":
      return InvoiceStatus.UNCOLLECTIBLE;
    default:
      return InvoiceStatus.DRAFT;
  }
}

/**
 * Convert Unix timestamp to Date object
 */
function convertTimestamp(timestamp: number | null | undefined): Date | null {
  return timestamp ? new Date(timestamp * 1000) : null;
}

export function convertStripeInvoiceToInvoiceCreateInput(
  stripeInvoice: Stripe.Invoice,
  ext: Omit<
    Prisma.InvoiceUncheckedCreateInput,
    | "status"
    | "number"
    | "currency"
    | "subtotal"
    | "tax"
    | "total"
    | "amountDue"
    | "issueDate"
    | "dueDate"
    | "paidAt"
    | "description"
    | "metadata"
    | "providerInvoiceId"
    | "invoiceUrl"
    | "invoicePdfUrl"
  >
): Prisma.InvoiceUncheckedCreateInput {
  const status = convertInvoiceStatus(stripeInvoice.status);

  const taxTotal =
    stripeInvoice.total_tax_amounts?.reduce((sum, tax) => sum + (tax.amount || 0), 0) ?? 0;

  // Calculate discount amount
  const discountTotal =
    stripeInvoice.total_discount_amounts?.reduce(
      (sum, discount) => sum + (discount.amount || 0),
      0
    ) ?? 0;

  return {
    ...ext,
    number: stripeInvoice.number || `INV-${stripeInvoice.id}`,
    status,
    currency: stripeInvoice.currency,
    billingScheme: BillingScheme.CREDIT_BASED,

    // Amount information
    subtotal: stripeInvoice.subtotal,
    tax: taxTotal,
    discount: discountTotal,
    total: stripeInvoice.total,
    amountDue: stripeInvoice.amount_due,
    amountPaid: stripeInvoice.amount_paid,
    amountRemaining: stripeInvoice.amount_remaining,
    amountRefunded: 0,

    // Customer information
    customerName: stripeInvoice.customer_name || null,
    customerEmail: stripeInvoice.customer_email || null,
    billingAddress: stripeInvoice.customer_address
      ? JSON.parse(JSON.stringify(stripeInvoice.customer_address))
      : null,

    // Provider specific IDs
    providerInvoiceId: stripeInvoice.id,

    // URLs
    invoiceUrl: stripeInvoice.hosted_invoice_url || null,
    invoicePdfUrl: stripeInvoice.invoice_pdf || null,

    // Dates
    issueDate: new Date(stripeInvoice.created * 1000),
    dueDate: convertTimestamp(stripeInvoice.due_date) || new Date(stripeInvoice.created * 1000),
    paidAt: convertTimestamp(stripeInvoice.status_transitions?.paid_at),

    // Additional information
    description: stripeInvoice.description || null,
    metadata: stripeInvoice.metadata || {},
  };
}
