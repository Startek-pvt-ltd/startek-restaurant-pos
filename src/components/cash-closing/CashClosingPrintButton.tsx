"use client";

import { Printer } from "lucide-react";

export function CashClosingPrintButton(){return <button className="no-print flex h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-primary" onClick={()=>window.print()} type="button"><Printer aria-hidden="true" className="size-4"/>Print closing report</button>}
