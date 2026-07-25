"use client";

import { Banknote, ChartNoAxesCombined, CircleDollarSign, ReceiptText, ShoppingBasket, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/reports", label: "Overview", icon: ChartNoAxesCombined },
  { href: "/reports/sales", label: "Sales", icon: ReceiptText },
  { href: "/reports/items", label: "Menu Items", icon: ShoppingBasket },
  { href: "/reports/payments", label: "Payments", icon: Banknote },
  { href: "/reports/cashiers", label: "Cashiers", icon: UsersRound },
  { href: "/reports/expenses", label: "Expenses", icon: CircleDollarSign },
];

export function ReportNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Report sections" className="no-print overflow-x-auto rounded-2xl border border-border bg-card p-2 dashboard-scrollbar"><ul className="flex min-w-max gap-1">{links.map((link) => { const active = pathname === link.href; const Icon = link.icon; return <li key={link.href}><Link aria-current={active ? "page" : undefined} className={cn("flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-primary", active ? "bg-secondary text-white" : "text-muted-foreground hover:bg-muted hover:text-secondary")} href={link.href}><Icon aria-hidden="true" className="size-4" />{link.label}</Link></li>; })}</ul></nav>;
}
