import type { OrderDetailRecord } from "@/features/orders/types";

import { ReceiptRow } from "./ReceiptRow";

export function ReceiptPayment({ money, payment }: { money: (value: string | null | undefined) => string; payment: OrderDetailRecord["payment"] }) {
  if (!payment) return <section className="receipt-section receipt-payment"><ReceiptRow label="Payment" value="Not recorded" /></section>;
  const cash = payment.paymentMethod === "CASH";
  return <section className="receipt-section receipt-payment"><ReceiptRow label="Payment" value={payment.paymentMethod} />{cash && <ReceiptRow label="Amount Received" value={money(payment.receivedAmount ?? payment.amount)} />}{cash && <ReceiptRow label="Balance" value={money(payment.balance)} />}{payment.reference && <ReceiptRow label="Reference" value={payment.reference} />}</section>;
}
