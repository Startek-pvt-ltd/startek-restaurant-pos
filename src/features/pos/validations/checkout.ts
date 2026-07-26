import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid("Invalid menu item."),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Add at least one item before checkout.")
    .max(100, "The cart contains too many different items."),
  orderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  notes: z.string().trim().max(500, "Order notes cannot exceed 500 characters."),
  paymentMethod: z.enum(["CASH", "CARD", "QR"]),
  amountReceived: z.number().finite().min(0).nullable(),
}).strict();
