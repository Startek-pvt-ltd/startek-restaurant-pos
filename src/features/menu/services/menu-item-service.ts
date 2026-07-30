import "server-only";

import { prisma } from "@/lib/prisma";
import { notifyActiveUsers } from "@/features/notifications/services/notification-service";

import type { MenuItemInput } from "../validations/menu-item";
import { menuItemDeleteMode } from "./deletion-policy";

export async function getMenuItems() {
  const items = await prisma.menuItem.findMany({
    where: { deletedAt: null, category: { deletedAt: null } },
    select: {
      id: true,
      categoryId: true,
      name: true,
      description: true,
      price: true,
      image: true,
      preparationTime: true,
      available: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      variants: {
        select: { id: true, name: true, price: true, displayOrder: true, active: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }],
  });

  return items.map(({ category, price, variants, createdAt, updatedAt, ...item }) => {
    const serializedVariants = variants.map((variant) => ({
      ...variant,
      price: variant.price.toFixed(2),
    }));
    return {
      ...item,
      categoryName: category.name,
      price: price.toFixed(2),
      variants: serializedVariants,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  });
}

async function menuItemNameExists(categoryId: string, name: string, excludeId?: string) {
  return prisma.menuItem.findFirst({
    where: {
      categoryId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
}

async function ensureCategoryExists(categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true },
  });

  if (!category) throw new Error("CATEGORY_NOT_FOUND");
}

export async function createMenuItem(input: MenuItemInput) {
  await ensureCategoryExists(input.categoryId);
  if (await menuItemNameExists(input.categoryId, input.name)) {
    throw new Error("MENU_ITEM_NAME_EXISTS");
  }

  return prisma.menuItem.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description || null,
      price: input.price,
      preparationTime: input.preparationTime,
      image: input.image || null,
      available: input.available,
      ...(input.hasVariants
        ? {
            variants: {
              create: input.variants.map((variant, index) => ({
                name: variant.name.trim(),
                price: variant.price,
                active: variant.active,
                displayOrder: index + 1,
              })),
            },
          }
        : {}),
    },
  });
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  await ensureCategoryExists(input.categoryId);
  if (await menuItemNameExists(input.categoryId, input.name, id)) {
    throw new Error("MENU_ITEM_NAME_EXISTS");
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.menuItem.update({
      where: { id },
      data: {
        categoryId: input.categoryId,
        name: input.name,
        description: input.description || null,
        price: input.price,
        preparationTime: input.preparationTime,
        image: input.image || null,
        available: input.available,
      },
    });

    await tx.menuItemVariant.deleteMany({ where: { menuItemId: id } });
    if (input.hasVariants) {
      await tx.menuItemVariant.createMany({
        data: input.variants.map((variant, index) => ({
          menuItemId: id,
          name: variant.name.trim(),
          price: variant.price,
          active: variant.active,
          displayOrder: index + 1,
        })),
      });
    }

    return item;
  });
}

export async function setMenuItemAvailable(id: string, available: boolean) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.menuItem.update({ where: { id }, data: { available }, select: { id: true, name: true, available: true } });
    await notifyActiveUsers(tx, { title: "Menu availability changed", message: `${item.name} is now ${item.available ? "available" : "unavailable"}.`, type: "MENU_AVAILABILITY", link: "/menu" });
    return item;
  });
}

export async function deleteMenuItem(id: string) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.menuItem.findUnique({
      where: { id },
      select: { deletedAt: true, _count: { select: { orderItems: true } } },
    });

    if (!item || item.deletedAt) throw new Error("MENU_ITEM_NOT_FOUND");

    const mode = menuItemDeleteMode(item._count.orderItems);
    if (mode === "hard-delete") {
      await tx.menuItem.delete({ where: { id } });
    } else {
      await tx.menuItem.update({
        where: { id },
        data: { available: false, deletedAt: new Date() },
      });
    }

    return { mode };
  });
}
