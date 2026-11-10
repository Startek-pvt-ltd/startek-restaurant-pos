import "server-only";

import { prisma } from "@/lib/prisma";

import type { CategoryInput } from "../validations/category";
import { categoryDeleteMode } from "./deletion-policy";

export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      description: true,
      displayOrder: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { menuItems: { where: { deletedAt: null } } } },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return categories.map(({ _count, createdAt, updatedAt, ...category }) => ({
    ...category,
    itemCount: _count.menuItems,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }));
}

async function categoryNameExists(name: string, excludeId?: string) {
  return prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
}

export async function createCategory(input: CategoryInput) {
  if (await categoryNameExists(input.name)) {
    throw new Error("CATEGORY_NAME_EXISTS");
  }

  return prisma.category.create({
    data: {
      name: input.name,
      description: input.description || null,
      displayOrder: input.displayOrder,
      active: input.active,
    },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  if (await categoryNameExists(input.name, id)) {
    throw new Error("CATEGORY_NAME_EXISTS");
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description || null,
      displayOrder: input.displayOrder,
      active: input.active,
    },
  });
}

export async function setCategoryActive(id: string, active: boolean) {
  return prisma.category.update({ where: { id }, data: { active } });
}

export async function deleteCategory(id: string) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id },
      select: {
        deletedAt: true,
        menuItems: { select: { deletedAt: true } },
      },
    });

    if (!category || category.deletedAt) throw new Error("CATEGORY_NOT_FOUND");

    const activeItemCount = category.menuItems.filter((item) => item.deletedAt === null).length;
    const mode = categoryDeleteMode(activeItemCount, category.menuItems.length);
    if (mode === "blocked") throw new Error("CATEGORY_HAS_ITEMS");

    if (mode === "hard-delete") {
      await tx.category.delete({ where: { id } });
    } else {
      await tx.category.update({
        where: { id },
        data: { active: false, deletedAt: new Date() },
      });
    }

    return { mode };
  });
}
