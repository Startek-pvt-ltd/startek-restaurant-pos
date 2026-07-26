import Link from "next/link";

export default function StaffNotFound() {
  return <section className="rounded-3xl border border-dashed border-input bg-card px-5 py-16 text-center"><h1 className="text-xl font-black text-secondary">Staff account not found</h1><p className="mt-2 text-sm text-muted-foreground">The account may not exist or may use a legacy unsupported role.</p><Link className="mt-5 inline-flex h-11 items-center rounded-xl bg-secondary px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-primary" href="/staff">Return to staff</Link></section>;
}
