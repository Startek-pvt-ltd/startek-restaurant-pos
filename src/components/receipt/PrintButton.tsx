"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return <button className="flex h-10 items-center gap-1.5 rounded-xl bg-secondary px-4 text-xs font-black text-white focus-visible:ring-2 focus-visible:ring-primary" onClick={() => window.print()} type="button"><Printer aria-hidden="true" className="size-4" />Print receipt</button>;
}
