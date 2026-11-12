import { receiptMessageLines } from "@/features/printing/lib/receipt-messages";
import type { ReceiptPrintSettings } from "@/features/settings/types";

export function ReceiptFooter({ settings }: { settings: ReceiptPrintSettings }) {
  const message = receiptMessageLines(settings.thankYouMessage, settings.visitAgainMessage).join("\n");

  return (
    <footer className="receipt-section receipt-footer">
      <p className="receipt-message receipt-thanks">{message}</p>
      {settings.footerText && <p className="receipt-message">{settings.footerText}</p>}
      <div className="receipt-spacer" />
      <p className="receipt-message">Powered by Startek (PVT) LTD</p>
    </footer>
  );
}
