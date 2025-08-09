import { hash } from "bcryptjs";
import { PrismaClient, Role } from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return await hash(password, 10);
}

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: {
      email: "admin@example.ai",
    },
    update: {},
    create: {
      email: "admin@example.ai",
      name: "Admin User",
      role: Role.ADMIN,
      locale: "en",
      password: await hashPassword("admin123"),
      emailVerified: new Date(),
    },
  });

  // Create regular users
  const regularUser1 = await prisma.user.upsert({
    where: {
      email: "user1@example.ai",
    },
    update: {},
    create: {
      email: "user1@example.ai",
      name: "Test User 1",
      role: Role.USER,
      locale: "en",
      password: await hashPassword("user123"),
      emailVerified: new Date(),
    },
  });

  const regularUser2 = await prisma.user.upsert({
    where: {
      email: "user2@example.ai",
    },
    update: {},
    create: {
      email: "user2@example.ai",
      name: "Test User 2",
      role: Role.USER,
      locale: "en",
      password: await hashPassword("user123"),
      emailVerified: null, // Unverified email
    },
  });

  console.log("Seeded admin user:", adminUser);
  console.log("Seeded regular user 1:", regularUser1);
  console.log("Seeded regular user 2:", regularUser2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
