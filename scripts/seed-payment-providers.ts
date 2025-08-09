import { AccountStatus, PaymentProvider, PrismaClient } from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

async function main() {
  const stripeProvider = await prisma.paymentProviderAccount.upsert({
    where: {
      code: "dream-stripe",
    },
    update: {},
    create: {
      id: "cm7suidkp0000v9nwu6vup67m",
      provider: PaymentProvider.STRIPE,
      name: "example Stripe",
      code: "dream-stripe",
      isActive: true,
      priority: 0,
      status: AccountStatus.ACTIVE,
      providerSecretKey:
        "sk_test_51PWWI6KRiB1Jmrow99vd9GFCmaZfODKODWSeSC5Drvg0GHIJ7KbspCRuvmr4efe84CLf5VkfuSRl7aqHY5KNHci600NlID47Z7",
      providerWebhookSecret:
        "whsec_6a9be60bb17b5631a9b30c09e54818948a2cbf117e35e8cf63ea7a7aad4e787c",
    },
  });

  console.log("Seeded payment provider:", stripeProvider);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
