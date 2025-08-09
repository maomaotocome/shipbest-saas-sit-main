// WARNING: This script is not idempotent. Running it multiple times will add MORE fake data.
// It assumes that users, payment providers, and billing plans have already been seeded.

import { faker } from "@faker-js/faker"; // Using faker for more realistic random data
import { addDays, addMonths, addYears } from "date-fns"; // Import date calculation functions
import {
  InvoiceStatus,
  PaymentProvider,
  PeriodType,
  PrismaClient,
  PurchaseStatus,
  SubscriptionPeriodStatus,
  SubscriptionStatus,
} from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

// Helper function to get a random element from an array
function getRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to get a random date in the past (up to 2 years)
function getRandomPastDate(): Date {
  return faker.date.past({ years: 2 });
}

// Function to generate a unique-ish affiliate code for seeding
function generateAffiliateCode(): string {
  return faker.string.alphanumeric(8).toUpperCase();
}

// Helper function to calculate period end date
function calculateEndDate(startDate: Date, type: PeriodType, value: number | null): Date {
  // Default to start date + 1 month if type/value invalid, or handle as needed
  let endDate = addMonths(startDate, 1);
  if (value === null || value <= 0) {
    console.warn(`Invalid periodValue ${value} for type ${type}. Defaulting end date.`);
    // Handle lifetime/one-time differently if needed, though they shouldn't reach here for subscriptions
    if (type === PeriodType.LIFETIME || type === PeriodType.ONE_TIME) {
      return startDate; // Or some far future date? Depends on logic.
    }
    return endDate;
  }

  try {
    switch (type) {
      case PeriodType.DAYS:
        endDate = addDays(startDate, value);
        break;
      case PeriodType.MONTHS:
        endDate = addMonths(startDate, value);
        break;
      case PeriodType.YEARS:
        endDate = addYears(startDate, value);
        break;
      // ONE_TIME and LIFETIME typically shouldn't be used for recurring subscription periods
      default:
        console.warn(`Unhandled PeriodType ${type} for end date calculation. Defaulting.`);
        endDate = addMonths(startDate, 1); // Default fallback
    }
  } catch (error) {
    console.error("Error calculating end date:", error, { startDate, type, value });
    endDate = addMonths(startDate, 1); // Fallback on error
  }
  return endDate;
}

async function main() {
  console.log("Starting to seed fake billing users, history, and invoices...");

  // 1. Fetch prerequisites
  const users = await prisma.user.findMany({ select: { id: true } });
  const providerAccounts = await prisma.paymentProviderAccount.findMany({
    select: { id: true, provider: true },
  });
  const allPlanPeriods = await prisma.planPeriod.findMany({
    where: { isActive: true },
    select: { id: true, price: true, currency: true, periodType: true, periodValue: true },
  });

  // Separate plan periods
  const subscriptionPlanPeriods = allPlanPeriods.filter(
    (p) => p.periodType !== PeriodType.ONE_TIME && p.periodType !== PeriodType.LIFETIME
  );
  const purchasePlanPeriods = allPlanPeriods.filter(
    (p) => p.periodType === PeriodType.ONE_TIME || p.periodType === PeriodType.LIFETIME
  );

  // Group provider accounts by provider
  const accountsByProvider = providerAccounts.reduce(
    (acc, account) => {
      if (!acc[account.provider]) {
        acc[account.provider] = [];
      }
      acc[account.provider].push(account.id);
      return acc;
    },
    {} as Record<PaymentProvider, string[]>
  );

  // 2. Check prerequisites
  if (users.length === 0) {
    // Check for Users
    console.error("Error: No Users found. Please seed users first.");
    return;
  }
  if (allPlanPeriods.length === 0) {
    console.error("Error: No active PlanPeriods found. Please seed billing plans first.");
    return;
  }
  if (providerAccounts.length === 0) {
    console.error("Error: No PaymentProviderAccounts found. Please seed payment providers first.");
    return;
  }
  if (subscriptionPlanPeriods.length === 0) {
    console.warn("Warning: No suitable PlanPeriods found for subscriptions.");
  }
  if (purchasePlanPeriods.length === 0) {
    console.warn("Warning: No suitable PlanPeriods found for purchases.");
  }

  let totalHistoryCreated = 0;
  let totalInvoicesCreated = 0;

  // 3. Loop through each user
  for (const user of users) {
    // Upsert BillingUser for the current User
    let billingUser;
    try {
      billingUser = await prisma.billingUser.upsert({
        where: { userId: user.id },
        update: {}, // No updates needed if exists
        create: {
          userId: user.id,
          affiliateInviteCode: generateAffiliateCode(), // Generate unique-ish code
          affiliateRewardPercent: faker.number.int({ min: 5, max: 20 }), // Randomize reward slightly
          // affiliatePaypalEmail can be added here if needed, e.g., faker.internet.email()
        },
        select: { id: true }, // Select only the ID we need
      });
      // Check if it was actually created (not just found)
      // Note: Upsert doesn't directly tell us if it created. A separate findFirst check before upsert would be needed for accurate count.
      // For simplicity in seeding, we'll just proceed.
    } catch (error) {
      console.error(`Failed to upsert BillingUser for User ${user.id}:`, error);
      continue; // Skip this user if BillingUser creation fails
    }

    const billingUserId = billingUser.id;

    const historyCount = faker.number.int({ min: 3, max: 50 });
    console.log(
      `Generating ${historyCount} history items for User ${user.id} (BillingUser ${billingUserId})...`
    );

    for (let i = 0; i < historyCount; i++) {
      const createSubscription = Math.random() > 0.5;

      if (createSubscription && subscriptionPlanPeriods.length > 0) {
        // Create Subscription
        const planPeriod = getRandomElement(subscriptionPlanPeriods)!;
        const provider = getRandomElement(Object.keys(accountsByProvider) as PaymentProvider[])!;
        const providerAccountId = getRandomElement(accountsByProvider[provider])!;
        const status = getRandomElement([
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.CANCELLED,
          SubscriptionStatus.EXPIRED,
        ])!;
        const createdAt = getRandomPastDate();
        const startDate = faker.date.soon({ days: 5, refDate: createdAt });
        let endDateForSubscription: Date | null = null; // Subscription end date
        let canceledAt: Date | null = null;

        if (status === SubscriptionStatus.CANCELLED) {
          endDateForSubscription = faker.date.between({ from: startDate, to: new Date() });
          canceledAt = faker.date.recent({ days: 10, refDate: endDateForSubscription });
        } else if (status === SubscriptionStatus.EXPIRED) {
          endDateForSubscription = faker.date.past({ years: 1, refDate: new Date() });
          if (endDateForSubscription < startDate) endDateForSubscription = startDate;
        } // Active subscriptions have null endDate in Subscription model

        let createdSubscription = null;
        try {
          createdSubscription = await prisma.subscription.create({
            data: {
              billingUserId: billingUserId, // Use the upserted BillingUser ID
              status: status,
              provider: provider,
              providerAccountId: providerAccountId,
              providerSubscriptionId: `sub_fake_${faker.string.uuid()}`,
              planPeriodId: planPeriod.id,
              currentPrice: planPeriod.price,
              startDate: startDate,
              endDate: endDateForSubscription, // Use calculated end date for non-active
              canceledAt: canceledAt,
              createdAt: createdAt,
            },
          });
          totalHistoryCreated++;

          // --- Create First SubscriptionPeriod and Invoice for ACTIVE subscriptions ---
          if (createdSubscription && createdSubscription.status === SubscriptionStatus.ACTIVE) {
            // Calculate period end date
            const periodEndDate = calculateEndDate(
              createdSubscription.startDate,
              planPeriod.periodType,
              planPeriod.periodValue
            );

            let createdPeriod = null;
            try {
              createdPeriod = await prisma.subscriptionPeriod.create({
                data: {
                  subscriptionId: createdSubscription.id,
                  status: SubscriptionPeriodStatus.ACTIVE, // Or derive from subscription status
                  periodNumber: 1, // First period
                  startDate: createdSubscription.startDate,
                  endDate: periodEndDate,
                  createdAt: createdSubscription.createdAt, // Or period start date
                },
              });

              // Create Invoice linked to the period
              if (createdPeriod) {
                const issueDate = createdPeriod.startDate;
                const totalAmount = createdSubscription.currentPrice; // Use price from subscription

                await prisma.invoice.create({
                  data: {
                    billingUserId: billingUserId,
                    providerAccountId: providerAccountId,
                    status: InvoiceStatus.PAID, // Assume first period is paid for active subs
                    number: `INV-FAKE-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                    currency: planPeriod.currency, // Get currency from plan period
                    subtotal: totalAmount,
                    tax: 0,
                    total: totalAmount,
                    amountDue: totalAmount, // Initially due
                    amountPaid: totalAmount, // Assume paid
                    amountRemaining: 0, // Paid
                    issueDate: issueDate,
                    dueDate: faker.date.soon({ days: 15, refDate: issueDate }),
                    paidAt: faker.date.soon({ days: 1, refDate: issueDate }),
                    createdAt: issueDate,
                    subscriptionPeriod: {
                      // Connect to SubscriptionPeriod
                      connect: { id: createdPeriod.id },
                    },
                    // Note: Removed purchase connection here
                  },
                });
                totalInvoicesCreated++;
              }
            } catch (periodError) {
              console.error(
                `Failed to create SubscriptionPeriod or Invoice for Subscription ${createdSubscription.id}:`,
                periodError
              );
            }
          }
        } catch (error) {
          console.error(`Failed to create subscription for BillingUser ${billingUserId}:`, error);
        }
      } else if (!createSubscription && purchasePlanPeriods.length > 0) {
        // Create Purchase
        const planPeriod = getRandomElement(purchasePlanPeriods)!;
        const provider = getRandomElement(Object.keys(accountsByProvider) as PaymentProvider[])!;
        const providerAccountId = getRandomElement(accountsByProvider[provider])!;
        const status = getRandomElement([PurchaseStatus.COMPLETED, PurchaseStatus.REFUNDED])!;
        const createdAt = getRandomPastDate();
        let createdPurchase = null;

        try {
          createdPurchase = await prisma.purchase.create({
            data: {
              billingUserId: billingUserId, // Use the upserted BillingUser ID
              status: status,
              provider: provider,
              providerAccountId: providerAccountId,
              providerOrderId: `order_fake_${faker.string.uuid()}`,
              planPeriodId: planPeriod.id,
              purchaseDate: createdAt,
              createdAt: createdAt,
            },
          });
          totalHistoryCreated++;

          if (createdPurchase && createdPurchase.status === PurchaseStatus.COMPLETED) {
            const issueDate = createdPurchase.purchaseDate;
            const totalAmount = planPeriod.price;

            await prisma.invoice.create({
              data: {
                billingUserId: billingUserId,
                providerAccountId: providerAccountId,
                status: InvoiceStatus.PAID,
                number: `INV-FAKE-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                currency: planPeriod.currency,
                subtotal: totalAmount,
                tax: 0,
                total: totalAmount,
                amountDue: totalAmount,
                amountPaid: totalAmount,
                amountRemaining: 0,
                issueDate: issueDate,
                dueDate: faker.date.soon({ days: 15, refDate: issueDate }),
                paidAt: faker.date.soon({ days: 1, refDate: issueDate }),
                createdAt: issueDate,
                purchase: {
                  connect: { id: createdPurchase.id },
                },
                // Note: Removed subscriptionPeriod connection here
              },
            });
            totalInvoicesCreated++;
          }
        } catch (error) {
          console.error(
            `Failed to create purchase or invoice for BillingUser ${billingUserId}:`,
            error
          );
        }
      } else {
        // Skip
      }
    }
  }

  console.log(
    `Finished seeding. Created/found BillingUsers for ${users.length} users. Created ${totalHistoryCreated} fake billing history items (subscriptions/purchases) and ${totalInvoicesCreated} invoices.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
