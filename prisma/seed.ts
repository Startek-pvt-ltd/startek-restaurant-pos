import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient, UserRole, UserStatus } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const restaurantId = "00000000-0000-4000-8000-000000000001";
const receiptFooter = "Design & Deploy by\n\nStartek (PVT) LTD";
const categoryNames = ["Rice", "Kottu", "Noodles", "Fried Rice", "Beverages", "Desserts"];

async function main() {
  await prisma.restaurant.upsert({
    where: { id: restaurantId },
    update: {
      name: "Rice & Kottu Hut",
      address: "No.32 Padukka Road\nMeegoda",
      phone: "0777250493",
      receiptFooter,
    },
    create: {
      id: restaurantId,
      name: "Rice & Kottu Hut",
      address: "No.32 Padukka Road\nMeegoda",
      phone: "0777250493",
      receiptFooter,
    },
  });

  const password = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      fullName: "Kevin Menuja",
      password,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: "Kevin Menuja",
      username: "admin",
      password,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.$transaction(
    categoryNames.map((name, index) =>
      prisma.category.upsert({
        where: { name },
        update: { displayOrder: index + 1, active: true },
        create: { name, displayOrder: index + 1 },
      }),
    ),
  );

  await prisma.$transaction(
    Array.from({ length: 20 }, (_, index) => {
      const tableNumber = `Table ${index + 1}`;

      return prisma.restaurantTable.upsert({
        where: { tableNumber },
        update: { active: true },
        create: { tableNumber },
      });
    }),
  );

  console.log("Seeded restaurant: Rice & Kottu Hut");
  console.log("Seeded super admin: Kevin Menuja (admin)");
  console.log(`Seeded categories: ${categoryNames.length}`);
  console.log("Seeded tables: 20");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
