import { z } from "zod";

export const printerSettingsSchema = z.object({
  printerName: z.string().trim().min(1).max(100),
  paperWidth: z.literal(80),
  autoOpenReceiptAfterCheckout: z.boolean(),
  autoPrintAfterCheckout: z.boolean(),
  printLogo: z.boolean(),
  receiptCopies: z.number().int().min(1).max(3),
  showTaxLine: z.boolean(),
  showServiceChargeLine: z.boolean(),
});
