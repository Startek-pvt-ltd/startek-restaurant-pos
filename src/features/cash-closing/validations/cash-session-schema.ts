import { z } from "zod";

const money = (label: string) => z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/, `${label} must be a valid amount with up to two decimals.`).refine((value) => Number(value) >= 0 && Number(value) <= 9_999_999_999.99, `${label} is outside the allowed range.`);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const openCashSessionSchema = z.object({
  openingCash: money("Opening cash"),
  openingNote: z.string().trim().max(500, "Opening note cannot exceed 500 characters."),
}).strict();

export const closeCashSessionSchema = z.object({
  sessionId: z.uuid("Invalid cash session."),
  actualCash: money("Actual cash"),
  notes: z.string().trim().max(1_000, "Closing notes cannot exceed 1,000 characters."),
  currentPassword: z.string().min(1, "Current password is required.").max(128, "Password is too long."),
  confirmed: z.literal(true, { error: "Confirm the closing totals before continuing." }),
}).strict();

export const cashSessionIdSchema = z.uuid("Invalid cash session.");

export const cashSessionFiltersSchema = z.object({
  query: z.string().trim().max(100).catch(""),
  dateFrom: z.string().regex(datePattern).optional().catch(undefined),
  dateTo: z.string().regex(datePattern).optional().catch(undefined),
  staffId: z.uuid().optional().catch(undefined),
  difference: z.enum(["EXACT", "OVER", "SHORT"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().refine((value) => [10, 20, 50].includes(value)).catch(10),
}).superRefine((value, context) => {
  if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) context.addIssue({ code: "custom", path: ["dateTo"], message: "End date must be on or after start date." });
});

export type OpenCashSessionInput = z.infer<typeof openCashSessionSchema>;
export type CloseCashSessionInput = z.infer<typeof closeCashSessionSchema>;
