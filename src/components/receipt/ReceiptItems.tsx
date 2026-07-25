import type { OrderDetailRecord } from "@/features/orders/types";

export function ReceiptItems({ items, money }: { items: OrderDetailRecord["items"]; money: (value: string | null | undefined) => string }) {
  return <section className="receipt-section"><div className="receipt-items-head"><span>Item</span><span>Qty</span><span>Price</span><span>Total</span></div>{items.map((item) => <div className="receipt-item" key={item.id}><div className="receipt-item-name">{item.name}</div><span>{item.quantity}</span><span>{money(item.unitPrice)}</span><span>{money(item.totalPrice)}</span></div>)}</section>;
}
