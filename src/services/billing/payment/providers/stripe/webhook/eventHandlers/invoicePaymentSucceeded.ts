import { createInvoice } from "@/db/billing/invoices/createInvoice";
import { updateInvoice } from "@/db/billing/invoices/updateInvoice";
import { getPlanPeriod } from "@/db/billing/planPeriods/getPlanPeriod";
import { getOrCreateSubscription } from "@/db/billing/subscriptions/getOrCreateSubscription";
import { ensurePeriod } from "@/db/billing/subscriptions/periods/ensurePeriod";
import { CreditSource } from "@/db/generated/prisma";
import { withTransaction } from "@/lib/prisma";
import { grantCredits } from "@/services/billing/credits/grant";
import { WebhookError } from "@/services/billing/payment/providers/stripe/webhook/errors/WebhookError";
import { convertStripeSubscription } from "@/services/billing/payment/providers/stripe/webhook/utils/convertStripeSubscription";
import { getResetPeriods } from "@/services/billing/payment/utIls/date";
import type Stripe from "stripe";
import { convertStripeInvoiceToInvoiceCreateInput } from "../utils/convertInvoice";
import { BaseWebhookEventHandler } from "./BaseWebhookEventHandler";
export class InvoicePaymentSucceededHandler extends BaseWebhookEventHandler {
  public readonly eventType = "invoice.payment_succeeded";

  async handle(event: Stripe.Event): Promise<void> {
    const stripeInvoice = event.data.object as Stripe.Invoice;

    if (this.isSubscriptionCycleInvoice(stripeInvoice)) {
      await this.processInvoicePayment(stripeInvoice);
    }
  }

  private isSubscriptionCycleInvoice(invoice: Stripe.Invoice): boolean {
    return invoice.billing_reason === "subscription_cycle";
  }

  private async processInvoicePayment(stripeInvoice: Stripe.Invoice): Promise<void> {
    const stripeSubscriptionId = stripeInvoice.subscription as string;

    if (!stripeSubscriptionId) {
      throw new WebhookError("Missing subscription ID in invoice");
    }

    try {
      const stripeSubscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
      const billingUserId = stripeSubscription.metadata?.billingUserId;

      if (!billingUserId) {
        throw new WebhookError("Missing required metadata: billingUserId");
      }

      await withTransaction(async (tx) => {
        const invoiceCreateInput = convertStripeInvoiceToInvoiceCreateInput(stripeInvoice, {
          billingUserId,
          providerAccountId: this.accountId,
        });

        const subscription = convertStripeSubscription({
          stripeSubscription,
          billingUserId,
          providerAccountId: this.accountId,
        });

        const invoice = await createInvoice(invoiceCreateInput, tx);
        const ensuredSubscription = await getOrCreateSubscription(subscription, tx);

        if (!ensuredSubscription) {
          throw new Error("Failed to create subscription or subscription periods");
        }

        const previousPeriod = ensuredSubscription.periods.length + 1;
        const latestPeriod = await ensurePeriod(
          {
            periodNumber: previousPeriod,
            startDate: new Date(stripeSubscription.current_period_start * 1000),
            endDate: new Date(stripeSubscription.current_period_end * 1000),
            subscriptionId: ensuredSubscription.id,
          },
          tx
        );

        await updateInvoice(
          {
            id: invoice.id,
            subscriptionPeriod: {
              connect: { id: latestPeriod.id },
            },
          },
          tx
        );

        const planPeriod = await getPlanPeriod(
          { periodsId: stripeSubscription.metadata?.periodId },
          tx
        );

        if (planPeriod?.creditValue) {
          const resetPeriods = getResetPeriods(latestPeriod.startDate, planPeriod);
          for (const resetPeriod of resetPeriods) {
            await grantCredits(
              {
                billingUserId,
                amount: planPeriod.creditValue ?? 0,
                validFrom: resetPeriod.startDate,
                validUntil: resetPeriod.endDate,
                source: CreditSource.SUBSCRIPTION_PERIODIC,
                subscriptionPeriodId: latestPeriod.id,
                description: `Credit grant for ${planPeriod.creditValue} credits for subscription (${ensuredSubscription.id}) periodic (${latestPeriod.id})`,
              },
              tx
            );
          }
        }
      });
    } catch (error: unknown) {
      console.error("Failed to process invoice payment:", error);
      throw new WebhookError("Failed to process invoice payment");
    }
  }
}
