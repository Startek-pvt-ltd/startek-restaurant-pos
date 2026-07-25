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

  const categories = await prisma.$transaction(
    categoryNames.map((name, index) =>
      prisma.category.upsert({
        where: { name },
        update: { displayOrder: index + 1, active: true },
        create: { name, displayOrder: index + 1 },
      }),
    ),
  );

  const menuItemCount = await prisma.menuItem.count();
  let seededMenuItemCount = 0;

  if (menuItemCount === 0) {
    const categoryIds = new Map(categories.map((category) => [category.name, category.id]));
    const samples = [
      { category: "Kottu", name: "Chicken Kottu", price: 1_250, preparationTime: 18 },
      { category: "Kottu", name: "Cheese Kottu", price: 1_400, preparationTime: 20 },
      { category: "Kottu", name: "Egg Kottu", price: 950, preparationTime: 15 },
      { category: "Fried Rice", name: "Chicken Fried Rice", price: 1_150, preparationTime: 16 },
      { category: "Fried Rice", name: "Mixed Fried Rice", price: 1_450, preparationTime: 18 },
      { category: "Noodles", name: "Chicken Noodles", price: 1_100, preparationTime: 16 },
      { category: "Noodles", name: "Seafood Noodles", price: 1_500, preparationTime: 20 },
      { category: "Beverages", name: "Coca-Cola", price: 250, preparationTime: 0 },
      { category: "Beverages", name: "Sprite", price: 250, preparationTime: 0 },
      { category: "Beverages", name: "Bottled Water", price: 150, preparationTime: 0 },
    ];

    const result = await prisma.menuItem.createMany({
      data: samples.map(({ category, ...item }) => {
        const categoryId = categoryIds.get(category);
        if (!categoryId) throw new Error(`Seed category not found: ${category}`);

        return { ...item, categoryId };
      }),
    });
    seededMenuItemCount = result.count;
  }

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
  console.log(
    seededMenuItemCount > 0
      ? `Seeded sample menu items: ${seededMenuItemCount}`
      : `Sample menu items skipped: ${menuItemCount} existing item(s) preserved`,
  );
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
