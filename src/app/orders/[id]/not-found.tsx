import { SearchX } from "lucide-react";
import Link from "next/link";

export default function OrderNotFound() {
  return <section className="rounded-2xl border border-dashed border-input bg-card px-5 py-16 text-center"><SearchX aria-hidden="true" className="mx-auto size-10 text-muted-foreground/55" /><h1 className="mt-4 text-xl font-black text-secondary">Order not found</h1><p className="mt-2 text-sm text-muted-foreground">The order identifier is invalid or the requested order does not exist.</p><Link className="mx-auto mt-5 inline-flex h-11 items-center rounded-xl bg-secondary px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-primary" href="/orders">Return to orders</Link></section>;
}
