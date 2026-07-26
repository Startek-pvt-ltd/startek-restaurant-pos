import { notFound } from "next/navigation";

import { ReceiptDocument } from "@/components/receipt/ReceiptDocument";
import { ReceiptPreviewToolbar } from "@/components/receipt/ReceiptPreviewToolbar";
import { getOrderDetail } from "@/features/orders/services/order-service";
import { orderIdSchema } from "@/features/orders/validations/order";
import { getPrinterSettings } from "@/features/settings/services/printer-settings-service";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ auto?: string }> }) {
  await requireAuth();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const parsedId = orderIdSchema.safeParse(id);
  if (!parsedId.success) notFound();
  const [order, settings] = await Promise.all([getOrderDetail(parsedId.data), getPrinterSettings()]);
  if (!order) notFound();

  return <div className="thermal-print-page"><ReceiptPreviewToolbar autoPrint={query.auto === "1"} copies={settings.receiptCopies} orderId={order.id} printerName={settings.printerName} /><div className="receipt-copies">{Array.from({ length: settings.receiptCopies }, (_, index) => <ReceiptDocument copy={index + 1} key={index} order={order} settings={settings} />)}</div></div>;
}
