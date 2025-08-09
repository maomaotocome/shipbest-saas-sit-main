import { CheckoutSessionCompletedHandler } from "./checkoutSessionCompleted";
import { CustomerSubscriptionDeletedHandler } from "./customerSubscriptionDeleted";
import { CustomerSubscriptionUpdatedHandler } from "./customerSubscriptionUpdated";
import { InvoicePaymentSucceededHandler } from "./invoicePaymentSucceeded";

export const eventHandlers = {
  "checkout.session.completed": CheckoutSessionCompletedHandler,
  "invoice.payment_succeeded": InvoicePaymentSucceededHandler,
  "customer.subscription.updated": CustomerSubscriptionUpdatedHandler,
  "customer.subscription.deleted": CustomerSubscriptionDeletedHandler,
} as const;

export type StripeEventType = keyof typeof eventHandlers;
