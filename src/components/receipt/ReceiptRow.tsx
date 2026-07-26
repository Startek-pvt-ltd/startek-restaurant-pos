export function ReceiptRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={strong ? "receipt-row receipt-total" : "receipt-row"}><span>{label}</span><span>{value}</span></div>;
}
