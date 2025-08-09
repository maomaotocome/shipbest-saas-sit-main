import { faker } from "@faker-js/faker";
import {
  CreditSource,
  CreditTransactionStatus,
  CreditTransactionType,
  Prisma,
  PrismaClient,
} from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

// Constants for seeding
const MIN_GRANTS_PER_USER = 3;
const MAX_GRANTS_PER_USER = 8;
const MIN_TRANSACTIONS_PER_USER = 10; // Updated minimum transactions
const MAX_TRANSACTIONS_PER_USER = 20; // Updated maximum transactions
const SEED_USER_COUNT = 10; // Number of users to seed credits for

async function main() {
  console.log("Start seeding credits data...");

  const users = await prisma.user.findMany({ take: SEED_USER_COUNT });

  if (users.length === 0) {
    console.log(`No users found (required: ${SEED_USER_COUNT}). Please seed users first.`);
    return;
  }

  for (const user of users) {
    console.log(`Seeding credits for user: ${user.email}`);

    // 1. Ensure BillingUser exists
    let billingUser = await prisma.billingUser.findUnique({
      where: { userId: user.id },
    });
    if (!billingUser) {
      billingUser = await prisma.billingUser.create({
        data: { userId: user.id },
      });
      console.log(`  Created BillingUser for ${user.email}`);
    }

    const billingUserId = billingUser.id;

    // 2. Create Credit Grants
    const grantsData: Prisma.CreditGrantCreateManyInput[] = [];
    const grantSources = Object.values(CreditSource);
    const numGrants = faker.number.int({ min: MIN_GRANTS_PER_USER, max: MAX_GRANTS_PER_USER });
    for (let i = 0; i < numGrants; i++) {
      const amount = faker.number.int({ min: 50, max: 1000 });
      const usedAmount = faker.number.int({ min: 0, max: amount / 2 });
      const reservedAmount = faker.number.int({ min: 0, max: (amount - usedAmount) / 2 });
      const remainingAmount = amount - usedAmount;
      const availableAmount = remainingAmount - reservedAmount;
      const validFrom = faker.date.past({ years: 1 });
      const validUntil = faker.datatype.boolean(0.7) // 70% chance of having an expiry date
        ? faker.date.future({ years: 1, refDate: validFrom })
        : null;

      grantsData.push({
        billingUserId,
        amount,
        remainingAmount,
        availableAmount,
        reservedAmount,
        usedAmount,
        source: faker.helpers.arrayElement(grantSources),
        validFrom,
        validUntil,
      });
    }
    await prisma.creditGrant.createMany({ data: grantsData });
    const createdGrants = await prisma.creditGrant.findMany({ where: { billingUserId } });
    console.log(`  Created ${createdGrants.length} Credit Grants.`);

    // 3. Create Credit Transactions and Details (Simplified Approach)
    const transactionsData: Prisma.CreditTransactionCreateInput[] = [];
    const transactionTypes = Object.values(CreditTransactionType);
    const transactionStatuses = Object.values(CreditTransactionStatus);

    const numTransactions = faker.number.int({
      min: MIN_TRANSACTIONS_PER_USER,
      max: MAX_TRANSACTIONS_PER_USER,
    });
    for (let i = 0; i < numTransactions; i++) {
      const transactionType = faker.helpers.arrayElement(transactionTypes);
      let transactionStatus = faker.helpers.arrayElement(transactionStatuses);
      // Simple logic adjustment for status based on type
      if (transactionType === "GRANT") transactionStatus = CreditTransactionStatus.GRANTED;
      if (transactionType === "REFUND") transactionStatus = CreditTransactionStatus.CONFIRMED; // Assuming refunds are auto-confirmed

      const transaction: Prisma.CreditTransactionCreateInput = {
        totalAmount: faker.number.int({ min: 5, max: 100 }),
        type: transactionType,
        status: transactionStatus,
        description: faker.lorem.sentence(),
        metadata: { seeded: true, reason: faker.lorem.words(3) },
        createdAt: faker.date.between({ from: faker.date.past({ years: 2 }), to: new Date() }),
        // Link details (simplified: link to one grant if possible)
        details: {},
      };

      // Attempt to link DEDUCT/RESERVE to a grant (simplified)
      if (
        (transactionType === "DEDUCT" || transactionType === "RESERVE") &&
        createdGrants.length > 0
      ) {
        const randomGrant = faker.helpers.arrayElement(createdGrants);
        // Ensure transaction amount isn't nonsensically large compared to grant
        transaction.totalAmount = Math.min(
          transaction.totalAmount,
          Math.floor(randomGrant.amount / 2)
        );

        transaction.details = {
          create: [
            {
              grantId: randomGrant.id,
              amount: transaction.totalAmount, // Simplified: assume whole amount from this grant
              balanceAfter: Math.max(0, randomGrant.remainingAmount - transaction.totalAmount), // Simplified balance calculation
            },
          ],
        };

        // TODO: A real seed should potentially update the grant balance,
        // but this is complex. Skipping for this simplified seed.
      }

      transactionsData.push(transaction);
    }

    // Use createMany if details don't need linking, otherwise loop create
    let createdTxCount = 0;
    for (const txData of transactionsData) {
      try {
        await prisma.creditTransaction.create({ data: txData });
        createdTxCount++;
      } catch (e) {
        console.error(`  Failed to create transaction: ${(e as Error).message}`);
        // Optionally log the full transaction data for debugging, but be mindful of sensitive info if any
        // console.error(`  Transaction Data: ${JSON.stringify(txData)}`);
      }
    }
    console.log(`  Created ${createdTxCount} Credit Transactions (with simplified details).`);
  }

  console.log("Credit seeding finished.");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
