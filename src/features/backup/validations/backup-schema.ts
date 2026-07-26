import { z } from "zod";
export const backupIdSchema=z.string().uuid("Invalid backup identifier.");
export const createBackupSchema=z.object({backupType:z.literal("FULL_DATABASE")});
export const restoreBackupSchema=z.object({backupId:z.string().uuid(),confirmation:z.literal("RESTORE RICE AND KOTTU HUT",{error:"Enter the exact confirmation phrase."}),password:z.string().min(1,"Current password is required."),acknowledged:z.literal(true,{error:"Acknowledge the overwrite risk."})});
export const exportSchema=z.object({
  dataset:z.enum(["orders","order-items","payments","menu-items","categories","expenses","staff","activity-logs","settings"]),format:z.enum(["csv","xlsx","json"]),
  start:z.iso.date().optional(),end:z.iso.date().optional(),status:z.enum(["PENDING","COMPLETED","CANCELLED"]).optional(),
  orderType:z.enum(["DINE_IN","TAKEAWAY","DELIVERY"]).optional(),paymentMethod:z.enum(["CASH","CARD","QR"]).optional(),cashierId:z.string().uuid().optional(),
  expenseCategory:z.enum(["INGREDIENTS","PACKAGING","GAS","ELECTRICITY","WATER","SALARY","TRANSPORT","MAINTENANCE","RENT","MARKETING","STAFF_MEALS","OTHER"]).optional(),
}).refine(v=>!v.start||!v.end||v.start<=v.end,{message:"Start date must not be after end date."});
