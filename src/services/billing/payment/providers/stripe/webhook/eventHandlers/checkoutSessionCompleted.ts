import { createInvoice } from "@/db/billing/invoices/createInvoice";
import { updateInvoice } from "@/db/billing/invoices/updateInvoice";
import { getPlanPeriod } from "@/db/billing/planPeriods/getPlanPeriod";
import { getOrCreatePurchase } from "@/db/billing/purchases/getOrCreatePurchase";
import { getOrCreateSubscription } from "@/db/billing/subscriptions/getOrCreateSubscription";
import { CreditSource, PeriodType } from "@/db/generated/prisma";
import { withTransaction } from "@/lib/prisma";
import { grantCredits } from "@/services/billing/credits/grant";
import { WebhookError } from "@/services/billing/payment/providers/stripe/webhook/errors/WebhookError";
import { convertStripeSubscription } from "@/services/billing/payment/providers/stripe/webhook/utils/convertStripeSubscription";
import { getResetDate, getResetPeriods } from "@/services/billing/payment/utIls/date";
import { CheckoutSessionMode } from "@/types/billing/stripe";
import Stripe from "stripe";
import { convertStripeInvoiceToInvoiceCreateInput } from "../utils/convertInvoice";
import { convertStripePurchase } from "../utils/convertStripePurchase";
import { BaseWebhookEventHandler } from "./BaseWebhookEventHandler";

export class CheckoutSessionCompletedHandler extends BaseWebhookEventHandler {
  private session!: Stripe.Checkout.Session;
  private billingUserId!: string;
  private metadata!: Stripe.Metadata;
  private stripeInvoice!: Stripe.Invoice;

  async handle(event: Stripe.Event) {
    this.session = event.data.object as Stripe.Checkout.Session;
    this.metadata = this.session.metadata as Stripe.Metadata;
    this.billingUserId = this.metadata?.billingUserId as string;

    if (!this.billingUserId) {
      throw new WebhookError("Missing metadata");
    }

    if (!this.session.invoice) {
      throw new WebhookError("Missing invoices ID in checkout session");
    }

    this.stripeInvoice = await this.stripe.invoices.retrieve(this.session.invoice as string);

    const mode = this.session.mode;
    if (mode === CheckoutSessionMode.SUBSCRIPTION) {
      await this.onSubscriptionSession();
    } else if (mode === CheckoutSessionMode.PAYMENT) {
      await this.onPaymentSession();
    }
  }

  private async onSubscriptionSession() {
    if (!this.session.subscription) {
      throw new WebhookError("Missing subscription ID in checkout session");
    }

    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      this.session.subscription as string
    );

    await withTransaction(async (tx) => {
      const invoiceCreateInput = convertStripeInvoiceToInvoiceCreateInput(this.stripeInvoice, {
        billingUserId: this.billingUserId,
        providerAccountId: this.accountId,
      });

      const subscription = convertStripeSubscription({
        stripeSubscription,
        billingUserId: this.billingUserId,
        planPeriodId: this.metadata?.periodId ?? "",
        providerAccountId: this.accountId,
        orderId: this.metadata?.orderId ?? this.session.id,
        countryCode: this.metadata.countryCode,
        ipAddress: this.metadata.ipAddress,
        utmData: this.metadata.utmData ? JSON.parse(this.metadata.utmData) : {},
      });

      const invoice = await createInvoice(invoiceCreateInput, tx);
      const ensuredSubscription = await getOrCreateSubscription(subscription, tx);

      if (!ensuredSubscription) {
        throw new Error("Failed to create subscription or subscription periods");
      }

      const latestPeriod = ensuredSubscription.periods[ensuredSubscription.periods.length - 1];

      await updateInvoice(
        {
          id: invoice.id,
          subscriptionPeriod: {
            connect: { id: latestPeriod.id },
          },
        },
        tx
      );

      const planPeriod = await getPlanPeriod({ periodsId: this.metadata?.periodId }, tx);

      if (planPeriod?.creditValue) {
        const resetPeriods = getResetPeriods(latestPeriod.startDate, planPeriod);
        for (const resetPeriod of resetPeriods) {
          await grantCredits(
            {
              billingUserId: this.billingUserId,
              amount: planPeriod.creditValue ?? 0,
              validFrom: resetPeriod.startDate,
              validUntil: resetPeriod.endDate,
              source: CreditSource.SUBSCRIPTION_PERIODIC,
              subscriptionPeriodId: latestPeriod.id,
              description: `Credit grant for ${planPeriod.creditValue} credits for subscription (${ensuredSubscription.id}) created`,
            },
            tx
          );
        }
      }
    });
  }

  private async onPaymentSession() {
    try {
      await withTransaction(async (tx) => {
        const invoiceCreateInput = convertStripeInvoiceToInvoiceCreateInput(this.stripeInvoice, {
          billingUserId: this.billingUserId,
          providerAccountId: this.accountId,
        });

        const invoice = await createInvoice(invoiceCreateInput, tx);
        const purchaseCreateInput = convertStripePurchase({
          stripeSession: this.session,
          stripeInvoice: this.stripeInvoice,
          billingUserId: this.billingUserId,
          planPeriodId: this.metadata.periodId,
          providerAccountId: this.accountId,
          purchaseId: this.metadata?.orderId ?? this.session.id,
          orderId: this.metadata?.orderId ?? this.session.id,
          countryCode: this.metadata.countryCode,
          ipAddress: this.metadata.ipAddress,
          utmData: this.metadata.utmData ? JSON.parse(this.metadata.utmData) : {},
          invoiceId: invoice.id,
        });

        const purchase = await getOrCreatePurchase(purchaseCreateInput, tx);

        await updateInvoice(
          {
            id: invoice.id,
            purchase: {
              connect: {
                id: purchase.id,
              },
            },
          },
          tx
        );

        const planPeriod = await getPlanPeriod({ periodsId: this.metadata.periodId }, tx);
        if (planPeriod) {
          const validFrom = new Date(this.stripeInvoice.created * 1000);
          const validUntil = getResetDate(validFrom, planPeriod);
          const isOneTimePurchase = planPeriod.periodType === PeriodType.ONE_TIME;
          await grantCredits(
            {
              billingUserId: this.billingUserId,
              amount: planPeriod.creditValue ?? 0,
              validFrom,
              validUntil,
              source: CreditSource.ONE_TIME_PURCHASE,
              purchaseId: purchase.id,
              description: `Credit grant for ${planPeriod.creditValue} credits for ${isOneTimePurchase ? "for one time purchase" : "for lifetime purchase"} (${purchase.id}) created`,
            },
            tx
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
