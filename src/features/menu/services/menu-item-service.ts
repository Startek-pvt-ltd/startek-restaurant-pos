import "server-only";

import { prisma } from "@/lib/prisma";

import type { MenuItemInput } from "../validations/menu-item";

export async function getMenuItems() {
  const items = await prisma.menuItem.findMany({
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
    },
    orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }],
  });

  return items.map(({ category, price, createdAt, updatedAt, ...item }) => ({
    ...item,
    categoryName: category.name,
    price: price.toFixed(2),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }));
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
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
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
      ...input,
      description: input.description || null,
      image: input.image || null,
    },
  });
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  await ensureCategoryExists(input.categoryId);
  if (await menuItemNameExists(input.categoryId, input.name, id)) {
    throw new Error("MENU_ITEM_NAME_EXISTS");
  }

  return prisma.menuItem.update({
    where: { id },
    data: {
      ...input,
      description: input.description || null,
      image: input.image || null,
    },
  });
}

export async function setMenuItemAvailable(id: string, available: boolean) {
  return prisma.menuItem.update({ where: { id }, data: { available } });
}

export async function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({ where: { id } });
}

