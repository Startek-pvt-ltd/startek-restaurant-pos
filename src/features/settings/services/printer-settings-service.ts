import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { PRINTER_MANAGER_ROLES, type PrinterSettings } from "../types";
import type { z } from "zod";
import type { printerSettingsSchema } from "../validations/printer-settings";

const defaults: PrinterSettings = {
  printerName: "Xprinter XP-80T",
  paperWidth: 80,
  autoOpenReceiptAfterCheckout: true,
  autoPrintAfterCheckout: false,
  printLogo: true,
  receiptCopies: 1,
  showTaxLine: true,
  showServiceChargeLine: true,
  openCashDrawer: false,
};

export async function getPrinterSettings(): Promise<PrinterSettings> {
  const setting = await prisma.systemSetting.findFirst({
    select: {
      printerName: true,
      printerPaperWidth: true,
      autoOpenReceiptAfterCheckout: true,
      autoPrintAfterCheckout: true,
      printLogo: true,
      receiptCopies: true,
      receiptShowTax: true,
      receiptShowServiceCharge: true,
      openCashDrawer: true,
    },
    orderBy: { id: "asc" },
  });

  if (!setting) return defaults;
  return {
    printerName: setting.printerName,
    paperWidth: setting.printerPaperWidth,
    autoOpenReceiptAfterCheckout: setting.autoOpenReceiptAfterCheckout,
    autoPrintAfterCheckout: setting.autoPrintAfterCheckout,
    printLogo: setting.printLogo,
    receiptCopies: setting.receiptCopies,
    showTaxLine: setting.receiptShowTax,
    showServiceChargeLine: setting.receiptShowServiceCharge,
    openCashDrawer: setting.openCashDrawer,
  };
}

export async function savePrinterSettings(
  input: z.infer<typeof printerSettingsSchema>,
  userId: string,
) {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });
    if (
      !user ||
      user.status !== "ACTIVE" ||
      !(PRINTER_MANAGER_ROLES as readonly UserRole[]).includes(user.role)
    ) {
      throw new Error("PRINTER_SETTINGS_ACCESS_DENIED");
    }
    const setting = await tx.systemSetting.findFirst({ select: { id: true }, orderBy: { id: "asc" } });
    if (!setting) throw new Error("SYSTEM_SETTINGS_NOT_FOUND");

    await tx.systemSetting.update({
      where: { id: setting.id },
      data: {
        printerName: input.printerName,
        printerPaperWidth: input.paperWidth,
        autoOpenReceiptAfterCheckout: input.autoOpenReceiptAfterCheckout,
        autoPrintAfterCheckout: input.autoPrintAfterCheckout,
        printLogo: input.printLogo,
        receiptCopies: input.receiptCopies,
        receiptShowTax: input.showTaxLine,
        receiptShowServiceCharge: input.showServiceChargeLine,
      },
    });
    await tx.activityLog.create({
      data: { userId, action: "UPDATED_PRINTER_SETTINGS Xprinter XP-80T" },
    });
  });
}
