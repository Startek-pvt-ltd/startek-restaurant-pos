import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const menu = [
  { category: "Fried Rice", name: "Chicken Fried Rice", normal: "700.00", full: "1000.00" },
  { category: "Fried Rice", name: "Egg Fried Rice", normal: "550.00", full: "850.00" },
  { category: "Roti Kottu", name: "Chicken Kottu", normal: "750.00", full: "1000.00" },
  { category: "Roti Kottu", name: "Egg Kottu", normal: "650.00", full: "900.00" },
  { category: "String Hoppers Kottu", name: "Chicken String Hoppers Kottu", normal: "900.00", full: "1200.00" },
  { category: "String Hoppers Kottu", name: "Egg String Hoppers Kottu", normal: "800.00", full: "1100.00" },
  { category: "Rice & Curry", name: "Chicken Rice & Curry", normal: "450.00", full: "550.00" },
  { category: "Rice & Curry", name: "Fish Rice & Curry", normal: "400.00", full: "500.00" },
  { category: "Rice & Curry", name: "Egg Rice & Curry", normal: "350.00", full: "450.00" },
  { category: "Rice & Curry", name: "Vegetable Rice & Curry", normal: "280.00", full: "380.00" },
] as const;

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    const maximumOrder = await tx.category.aggregate({ _max: { displayOrder: true } });
    let nextDisplayOrder = (maximumOrder._max.displayOrder ?? 0) + 1;
    const categoryIds = new Map<string, string>();
    let categoriesCreated = 0;
    let itemsCreated = 0;

    for (const categoryName of [...new Set(menu.map((item) => item.category))]) {
      const existing = await tx.category.findFirst({
        where: { name: { equals: categoryName, mode: "insensitive" } },
        select: { id: true },
      });
      const category = existing
        ? await tx.category.update({ where: { id: existing.id }, data: { active: true }, select: { id: true } })
        : await tx.category.create({
            data: { name: categoryName, active: true, displayOrder: nextDisplayOrder++ },
            select: { id: true },
          });
      if (!existing) categoriesCreated += 1;
      categoryIds.set(categoryName, category.id);
    }

    for (const definition of menu) {
      const categoryId = categoryIds.get(definition.category);
      if (!categoryId) throw new Error(`Category was not prepared: ${definition.category}`);

      const existing = await tx.menuItem.findFirst({
        where: { categoryId, name: { equals: definition.name, mode: "insensitive" } },
        select: { id: true },
      });
      const item = existing
        ? await tx.menuItem.update({
            where: { id: existing.id },
            data: { price: definition.normal },
            select: { id: true },
          })
        : await tx.menuItem.create({
            data: {
              categoryId,
              name: definition.name,
              price: definition.normal,
              available: true,
              variants: {
                create: [
                  { name: "Normal", price: definition.normal, displayOrder: 1 },
                  { name: "Full", price: definition.full, displayOrder: 2 },
                ],
              },
            },
            select: { id: true },
          });
      if (!existing) itemsCreated += 1;

      if (existing) {
        await tx.menuItemVariant.upsert({
          where: { menuItemId_name: { menuItemId: item.id, name: "Normal" } },
          create: { menuItemId: item.id, name: "Normal", price: definition.normal, displayOrder: 1 },
          update: { price: definition.normal, displayOrder: 1, active: true },
        });
        await tx.menuItemVariant.upsert({
          where: { menuItemId_name: { menuItemId: item.id, name: "Full" } },
          create: { menuItemId: item.id, name: "Full", price: definition.full, displayOrder: 2 },
          update: { price: definition.full, displayOrder: 2, active: true },
        });
      }
    }

    return { categoriesCreated, itemsCreated };
  });

  console.log(`Menu-size import complete: ${result.categoriesCreated} categories created.`);
  console.log(`Menu-size import complete: ${result.itemsCreated} menu items created.`);
  console.log(`Menu-size import complete: ${menu.length * 2} required variants verified.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
