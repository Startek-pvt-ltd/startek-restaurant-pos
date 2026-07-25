"use client";

import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface TopbarProps {
  onMenuClick: () => void;
  user: {
    fullName: string;
    role: string;
  };
}

export function Topbar({ onMenuClick, user }: TopbarProps) {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const pageMeta = pathname === "/menu/categories"
    ? { title: "Categories", description: "Menu organization" }
    : pathname.startsWith("/reports")
      ? { title: "Reports", description: "Reporting workspace" }
    : pathname.startsWith("/expenses")
      ? { title: "Expenses", description: "Expense management workspace" }
    : pathname.startsWith("/staff")
      ? { title: "Staff", description: "Staff management workspace" }
    : pathname.startsWith("/settings")
      ? { title: "Settings", description: "System and receipt printing preferences" }
    : pathname.startsWith("/orders/")
      ? { title: "Order Details", description: "Invoice and payment information" }
    : pathname === "/orders"
      ? { title: "Orders", description: "Order history and status management" }
    : pathname.startsWith("/pos")
      ? { title: "POS Billing", description: "Fast order entry and checkout" }
    : pathname.startsWith("/menu")
      ? { title: "Menu Management", description: "Items, pricing and availability" }
        : { title: "Dashboard", description: "Business overview" };
  const initials = useMemo(
    () =>
      user.fullName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [user.fullName],
  );

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-border/80 bg-card/92 px-4 shadow-[0_6px_24px_rgba(74,35,16,0.04)] backdrop-blur-xl sm:px-6 lg:px-8 2xl:px-10">
      <button
        aria-label="Open navigation"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        onClick={onMenuClick}
        type="button"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <div className="min-w-0">
        <p className="truncate text-base font-bold text-foreground sm:text-lg">{pageMeta.title}</p>
        <p className="hidden text-xs text-muted-foreground sm:block">{pageMeta.description}</p>
      </div>

      <div className="hidden border-l border-border pl-4 text-sm xl:block">
        <p className="font-semibold text-foreground">
          {now?.toLocaleDateString("en-LK", { weekday: "long", day: "numeric", month: "short", year: "numeric" }) ??
            "Loading date"}
        </p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          {now?.toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) ??
            "Loading time"}
        </p>
      </div>

      <label className="relative ml-auto hidden w-full max-w-sm md:block">
        <span className="sr-only">Search current workspace</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          className="h-11 w-full rounded-xl border border-border bg-background/70 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/75 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          placeholder="Search workspace..."
          type="search"
        />
      </label>

      <button
        aria-label="View notifications"
        className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
        type="button"
      >
        <Bell aria-hidden="true" className="size-5" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
      </button>

      <div className="flex shrink-0 items-center gap-3 border-l border-border pl-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-white shadow-sm">
          {initials}
        </div>
        <div className="hidden max-w-36 min-w-0 sm:block">
          <p className="truncate text-sm font-bold text-foreground">{user.fullName}</p>
          <p className="truncate text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {user.role.replaceAll("_", " ")}
          </p>
        </div>
      </div>
    </header>
  );
}
