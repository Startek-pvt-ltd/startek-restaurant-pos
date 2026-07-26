import { z } from "zod";

const imagePathSchema = z
  .string()
  .trim()
  .max(500, "Image path cannot exceed 500 characters.")
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/menu-items/") ||
      /^https?:\/\/[^\s]+$/i.test(value),
    "Use an http(s) image URL or a local /menu-items/... path.",
  );

const priceSchema = z
  .number({ error: "Price must be a number." })
  .positive("Price must be greater than zero.")
  .max(99_999_999.99, "Price is too large.");

const variantSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Variant name is required.")
    .max(32, "Variant name cannot exceed 32 characters."),
  price: priceSchema,
  active: z.boolean(),
});

export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Item name must contain at least 2 characters.")
    .max(120, "Item name cannot exceed 120 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1,000 characters."),
  categoryId: z.string().uuid("Select a valid category."),
  price: priceSchema,
  hasVariants: z.boolean(),
  variants: z.array(variantSchema).max(12, "Use 12 variants or fewer."),
  preparationTime: z
    .number({ error: "Preparation time must be a number." })
    .int("Preparation time must be a whole number.")
    .min(0, "Preparation time cannot be negative.")
    .max(1_440, "Preparation time cannot exceed 1,440 minutes."),
  image: imagePathSchema,
  available: z.boolean(),
}).superRefine((value, context) => {
  if (!value.hasVariants) return;

  if (value.variants.length === 0) {
    context.addIssue({
      code: "custom",
      message: "Add at least one variant.",
      path: ["variants"],
    });
  }

  const names = new Set<string>();
  let activeCount = 0;
  value.variants.forEach((variant, index) => {
    const normalizedName = variant.name.trim().toLocaleLowerCase();
    if (names.has(normalizedName)) {
      context.addIssue({
        code: "custom",
        message: "Variant names must be unique.",
        path: ["variants", index, "name"],
      });
    }
    names.add(normalizedName);
    if (variant.active) activeCount += 1;
  });

  if (activeCount === 0) {
    context.addIssue({
      code: "custom",
      message: "At least one active variant is required.",
      path: ["variants"],
    });
  }
});

export const menuItemIdSchema = z.string().uuid("Invalid menu item identifier.");

export type MenuItemInput = z.infer<typeof menuItemSchema>;
