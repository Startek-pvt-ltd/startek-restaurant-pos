export type PrinterSettings = {
  printerName: string;
  paperWidth: number;
  autoOpenReceiptAfterCheckout: boolean;
  autoPrintAfterCheckout: boolean;
  printLogo: boolean;
  receiptCopies: number;
  showCustomerInformation: boolean;
  showTaxLine: boolean;
  showServiceChargeLine: boolean;
  thankYouMessage: string;
  developerCredit: string;
  openCashDrawer: boolean;
};

export type PrinterSettingsResult =
  | { success: true; message: string }
  | { success: false; message: string };

export const PRINTER_MANAGER_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER"] as const;
