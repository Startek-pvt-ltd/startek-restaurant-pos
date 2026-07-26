import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(80, "Category name cannot exceed 80 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters."),
  displayOrder: z
    .number({ error: "Display order must be a number." })
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative."),
  active: z.boolean(),
});

export const categoryIdSchema = z.string().uuid("Invalid category identifier.");

export type CategoryInput = z.infer<typeof categorySchema>;

