import { z } from "zod";

const optionalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();

export const orderIdSchema = z.string().uuid("Invalid order identifier.");

export const cancellationSchema = z.object({
  orderId: orderIdSchema,
  reason: z
    .string()
    .trim()
    .min(3, "Enter a cancellation reason of at least 3 characters.")
    .max(300, "Cancellation reason cannot exceed 300 characters."),
});

export const orderFiltersSchema = z.object({
  query: z.string().trim().max(100).catch(""),
  dateFrom: optionalDate.catch(undefined),
  dateTo: optionalDate.catch(undefined),
  orderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).optional().catch(undefined),
  paymentMethod: z.enum(["CASH", "CARD", "QR"]).optional().catch(undefined),
  paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED"]).optional().catch(undefined),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional().catch(undefined),
  sort: z.enum(["newest", "oldest"]).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(10).max(50).catch(10),
});
