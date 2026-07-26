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
  price: z
    .number({ error: "Price must be a number." })
    .positive("Price must be greater than zero.")
    .max(99_999_999.99, "Price is too large."),
  preparationTime: z
    .number({ error: "Preparation time must be a number." })
    .int("Preparation time must be a whole number.")
    .min(0, "Preparation time cannot be negative.")
    .max(1_440, "Preparation time cannot exceed 1,440 minutes."),
  image: imagePathSchema,
  available: z.boolean(),
});

export const menuItemIdSchema = z.string().uuid("Invalid menu item identifier.");

export type MenuItemInput = z.infer<typeof menuItemSchema>;

