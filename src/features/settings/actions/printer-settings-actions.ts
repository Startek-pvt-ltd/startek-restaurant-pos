"use server";

import { revalidatePath } from "next/cache";

import type { UserRole } from "@/generated/prisma/client";
import { hasRole, requireAuth } from "@/lib/auth-utils";

import { PRINTER_MANAGER_ROLES, type PrinterSettingsResult } from "../types";
import { savePrinterSettings } from "../services/printer-settings-service";
import { printerSettingsSchema } from "../validations/printer-settings";

export async function updatePrinterSettingsAction(input: unknown): Promise<PrinterSettingsResult> {
  const session = await requireAuth();
  if (!hasRole(session.user.role, PRINTER_MANAGER_ROLES as readonly UserRole[])) {
    return { success: false, message: "Only an owner or manager can update printer settings." };
  }
  const parsed = printerSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid printer settings." };
  }

  try {
    await savePrinterSettings(parsed.data, session.user.id);
    revalidatePath("/settings");
    revalidatePath("/settings/receipt");
    revalidatePath("/pos");
    return { success: true, message: "Xprinter XP-80T settings saved." };
  } catch (error) {
    if (error instanceof Error && error.message === "PRINTER_SETTINGS_ACCESS_DENIED") {
      return { success: false, message: "Only an active owner or manager can update printer settings." };
    }
    console.error("Unable to save printer settings.", error);
    return { success: false, message: "Printer settings could not be saved. Please try again." };
  }
}
