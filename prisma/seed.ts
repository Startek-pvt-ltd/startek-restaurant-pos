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
const systemSettingId = "00000000-0000-4000-8000-000000000002";
const receiptFooter = "Design & Deploy by\n\nStartek (PVT) LTD";
const categoryNames = ["Rice", "Kottu", "Noodles", "Fried Rice", "Beverages", "Desserts"];

async function main() {
  await prisma.restaurant.upsert({
    where: { id: restaurantId },
    update: {},
    create: {
      id: restaurantId,
      name: "Rice & Kottu Hut",
      address: "No.32 Padukka Road\nMeegoda",
      addressLine1: "No.32, Padukka Road",
      city: "Meegoda",
      phone: "0777250493",
      phone2: "0778375427",
      receiptFooter,
    },
  });

  await prisma.systemSetting.upsert({
    where: { id: systemSettingId },
    update: {},
    create: {
      id: systemSettingId,
      restaurantName: "Rice & Kottu Hut",
      logo: "/logos/rice-kottu-hut-logo.png",
      receiptFooter: "Thank You!\nPlease Visit Again\n\nDesign & Deploy by\nStartek (PVT) LTD",
      printerName: "Xprinter XP-80T",
      printerPaperWidth: 80,
      autoOpenReceiptAfterCheckout: true,
      autoPrintAfterCheckout: false,
      printLogo: true,
      receiptCopies: 1,
      receiptShowCustomerInfo: false,
      receiptShowTax: false,
      receiptShowServiceCharge: false,
      receiptThankYouMessage: "Thank You!\nPlease Visit Again",
      receiptDeveloperCredit: "Design & Deploy by\nStartek (PVT) LTD",
      currencySymbol: "Rs.",
      taxEnabled: false,
      serviceChargeEnabled: false,
      discountEnabled: false,
      maximumPercentageDiscount: 0,
      maximumFixedDiscount: 0,
      allowCash: true,
      allowCard: true,
      allowQr: true,
      invoicePrefix: "RKH",
      invoiceNumberPadding: 4,
      openCashDrawer: false,
    },
  });

  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" }, select: { id: true } });
  if (!existingAdmin) {
    const initialPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;
    if (!initialPassword || initialPassword.length < 12 || !/[a-z]/.test(initialPassword) || !/[A-Z]/.test(initialPassword) || !/\d/.test(initialPassword) || !/[^A-Za-z0-9]/.test(initialPassword)) {
      throw new Error("SEED_SUPER_ADMIN_PASSWORD must be at least 12 characters and include upper, lower, number, and symbol characters for a new installation.");
    }
    await prisma.user.create({ data: { fullName: "Kevin Menuja", username: "admin", password: await bcrypt.hash(initialPassword, 12), role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE } });
  }

  const categories = await prisma.$transaction(
    categoryNames.map((name, index) =>
      prisma.category.upsert({
        where: { name },
        update: {},
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

  console.log("Seeded restaurant: Rice & Kottu Hut");
  console.log("Seeded printer settings: Xprinter XP-80T (80 mm)");
  console.log("Seeded super admin: Kevin Menuja (admin)");
  console.log(`Seeded categories: ${categoryNames.length}`);
  console.log(
    seededMenuItemCount > 0
      ? `Seeded sample menu items: ${seededMenuItemCount}`
      : `Sample menu items skipped: ${menuItemCount} existing item(s) preserved`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
