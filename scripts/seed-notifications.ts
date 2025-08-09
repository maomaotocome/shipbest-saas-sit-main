import { fakerEN, fakerZH_CN } from "@faker-js/faker";
import {
  NotificationReadStatus,
  NotificationTargetUserType,
  NotificationType,
  PrismaClient,
} from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

// Helper function to generate a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Starting notifications seeding...");

  // Clean up existing data
  await prisma.notificationMessageUserStatus.deleteMany();
  await prisma.notificationMessageTranslation.deleteMany();
  await prisma.notificationMessage.deleteMany();
  console.log("🧹 Cleaned up existing notification data.");

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  if (users.length === 0) {
    console.log("⚠️ No users found in the database. Please run seed-users.ts first.");
    return;
  }
  console.log(`👥 Found ${users.length} users.`);

  // --- Generate Personalized Notifications ---
  console.log("👤 Generating personalized notifications for each user...");
  let personalizedCount = 0;
  for (const user of users) {
    const numberOfNotifications = getRandomInt(10, 20); // Generate 10 to 20 notifications per user
    for (let i = 0; i < numberOfNotifications; i++) {
      await prisma.notificationMessage.create({
        data: {
          type: NotificationType.PERSONALIZED,
          translations: {
            create: [
              {
                locale: "en",
                title: `Personalized Msg ${i + 1} for ${user.id.substring(0, 5)}`, // Simplified title
                content: fakerEN.lorem.sentence(),
              },
              {
                locale: "zh",
                title: `给 ${user.id.substring(0, 5)} 的个性化消息 ${i + 1}`,
                content: fakerZH_CN.lorem.sentence(),
              },
            ],
          },
          userStatuses: {
            create: [
              {
                userId: user.id,
                status: NotificationReadStatus.UNREAD,
              },
            ],
          },
        },
      });
      personalizedCount++;
    }
    console.log(
      `👤 Created ${numberOfNotifications} personalized notifications for user ${user.id}`
    );
  }
  console.log(`✅ Generated a total of ${personalizedCount} personalized notifications.`);

  // --- Generate Global System Notifications ---
  console.log("🌍 Generating global system notifications...");
  const numberOfGlobalNotifications = getRandomInt(5, 10); // Generate 5 to 10 global notifications
  for (let i = 0; i < numberOfGlobalNotifications; i++) {
    await prisma.notificationMessage.create({
      data: {
        type: NotificationType.SYSTEM,
        targetUserType: NotificationTargetUserType.ALL, // Target all users
        translations: {
          create: [
            {
              locale: "en",
              title: `Global System Update ${i + 1}`,
              content: fakerEN.company.catchPhrase(),
            },
            {
              locale: "zh",
              title: `全局系统更新 ${i + 1}`,
              content: fakerZH_CN.lorem.sentence(),
            },
          ],
        },
        // No userStatuses needed for global notifications of type SYSTEM + ALL
        // The application logic should handle showing these to all users.
      },
    });
  }
  console.log(`✅ Generated ${numberOfGlobalNotifications} global system notifications.`);

  console.log("🎉 Notifications seeding finished!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding notifications:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
