import "server-only";

import { randomUUID } from "node:crypto";

import { getOrderDetail } from "@/features/orders/services/order-service";
import { getSettingsBundle } from "@/features/settings/services/settings-service";

import { renderReceiptText } from "../lib/receipt-text";
import { shouldOpenCashDrawer } from "../lib/printing-policy";

type BridgeResult = { success: boolean; message: string; receiptSent?: boolean; drawerOpened?: boolean; cut?: boolean };

function bridgeConfig() {
  const rawUrl = process.env.PRINTER_BRIDGE_URL?.trim(); const token = process.env.PRINTER_BRIDGE_TOKEN?.trim();
  if (!rawUrl || !token) throw new Error("PRINTER_BRIDGE_NOT_CONFIGURED");
  const url = new URL(rawUrl);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "::1", "[::1]"].includes(url.hostname)) throw new Error("PRINTER_BRIDGE_URL_UNSAFE");
  return { url: new URL("/v1/jobs", url), token };
}

async function sendJob(payload: Record<string, unknown>): Promise<BridgeResult> {
  const { url, token } = bridgeConfig();
  try {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000), cache: "no-store" });
    const result = await response.json().catch(() => null) as BridgeResult | null;
    if (!response.ok || !result?.success) throw new Error(`PRINTER_JOB_FAILED:${result?.message || `HTTP ${response.status}`}`);
    return result;
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("PRINTER_BRIDGE_") || error.message.startsWith("PRINTER_JOB_FAILED:"))) throw error;
    throw new Error("PRINTER_BRIDGE_OFFLINE", { cause: error });
  }
}

export async function printCompletedOrder(orderId: string) {
  const [order, bundle] = await Promise.all([getOrderDetail(orderId), getSettingsBundle()]);
  if (!order || order.status !== "COMPLETED" || order.payment?.paymentStatus !== "PAID") throw new Error("ORDER_NOT_READY_TO_PRINT");
  if (bundle.printer.mode !== "ESC_POS_BRIDGE") return { mode: "BROWSER" as const, success: true, message: "Use the browser print dialog." };
  const openDrawer = shouldOpenCashDrawer(order.payment.paymentMethod, bundle.printer.cashDrawerEnabled, bundle.printer.drawerOpenMode);
  const result = await sendJob({ jobId: `order:${order.id}`, printerName: bundle.printer.printerName, receiptText: renderReceiptText(order, { ...bundle.printer, ...bundle.receipt }), openDrawer, automaticCut: bundle.printer.automaticCut, drawerPin: bundle.printer.drawerPin, drawerPulseOnMs: bundle.printer.drawerPulseOnMs, drawerPulseOffMs: bundle.printer.drawerPulseOffMs });
  return { mode: "ESC_POS_BRIDGE" as const, ...result };
}

export async function testPrinterHardware(kind: "PRINT" | "DRAWER") {
  const bundle = await getSettingsBundle();
  if (bundle.printer.mode !== "ESC_POS_BRIDGE") throw new Error("DIRECT_PRINTING_DISABLED");
  return sendJob({ jobId: `test:${kind.toLowerCase()}:${randomUUID()}`, printerName: bundle.printer.printerName, receiptText: kind === "PRINT" ? "STARTEK POS\nPrinter test successful\n\n" : "", openDrawer: kind === "DRAWER", automaticCut: kind === "PRINT" && bundle.printer.automaticCut, drawerPin: bundle.printer.drawerPin, drawerPulseOnMs: bundle.printer.drawerPulseOnMs, drawerPulseOffMs: bundle.printer.drawerPulseOffMs });
}
