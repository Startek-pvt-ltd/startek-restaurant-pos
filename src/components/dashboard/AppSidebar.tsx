"use client";

import {
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  ContactRound,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  ReceiptText,
  Settings,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/app/dashboard/logout-button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "POS Billing", href: "/pos", icon: ReceiptText },
  { label: "Menu Management", href: "/menu", icon: UtensilsCrossed },
  { label: "Orders", href: "/orders", icon: ClipboardList },
  { label: "Reports", href: "/reports", icon: ChartNoAxesCombined },
  { label: "Expenses", href: "/expenses", icon: CircleDollarSign },
  { label: "Staff", href: "/staff", icon: ContactRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        aria-label="Close navigation"
        className={cn(
          "no-print fixed inset-0 z-40 bg-secondary/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <aside
        aria-label="Application sidebar"
        className={cn(
          "no-print fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-secondary text-white shadow-[14px_0_45px_rgba(74,35,16,0.16)] transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-24 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm">
            <Image
              alt="Rice & Kottu Hut logo"
              className="h-full w-full object-contain"
              height={120}
              priority
              src="/logos/rice-kottu-hut-logo.png"
              width={120}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">Rice &amp; Kottu Hut</p>
            <p className="mt-0.5 text-xs font-medium text-white/55">Restaurant POS</p>
          </div>
          <button
            aria-label="Close sidebar"
            className="ml-auto flex size-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="min-h-0 flex-1 overflow-y-auto px-3 py-5 dashboard-scrollbar">
          <p className="mb-3 px-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/35">Workspace</p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary",
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_8px_22px_rgba(244,180,0,0.22)]"
                        : "text-white/70 hover:translate-x-0.5 hover:bg-white/10 hover:text-white",
                    )}
                    href={item.href}
                    onClick={onClose}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn("size-[1.15rem]", active ? "text-secondary" : "text-white/55 group-hover:text-primary")}
                    />
                    <span>{item.label}</span>
                    {active && <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-secondary" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <LogoutButton
            className="h-11 w-full justify-start gap-3 rounded-xl bg-transparent px-3 text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-primary"
            icon={<LogOut aria-hidden="true" className="size-[1.15rem]" />}
          />
          <div className="mt-2 flex items-center gap-2 px-3 text-[0.65rem] text-white/35">
            <Store aria-hidden="true" className="size-3.5" />
            <span>Powered by Startek</span>
            <PanelLeftClose aria-hidden="true" className="ml-auto size-3.5" />
          </div>
        </div>
      </aside>
    </>
  );
}
