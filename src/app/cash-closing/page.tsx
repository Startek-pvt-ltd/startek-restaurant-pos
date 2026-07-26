import Link from "next/link";
import { History } from "lucide-react";
import { CashSessionPanel } from "@/components/cash-closing/CashSessionPanel";
import { getActiveCashSession } from "@/features/cash-closing/services/cash-session-service";
import { CASH_SESSION_MANAGEMENT_ROLES } from "@/features/cash-closing/types";
import { requireAuth } from "@/lib/auth-utils";

export default async function CashClosingPage(){
  const [auth,session]=await Promise.all([requireAuth(),getActiveCashSession()]);
  const management = CASH_SESSION_MANAGEMENT_ROLES.includes(auth.user.role);
  return <div className="space-y-5 pb-8"><header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Register control</p><h1 className="mt-1 text-3xl font-black text-foreground">Daily Cash Closing</h1><p className="mt-1 text-sm text-muted-foreground">Open the register, monitor live totals, and reconcile the physical drawer.</p></div>{management&&<Link className="no-print flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-black" href="/cash-closing/history"><History className="size-4"/>Closing History</Link>}</header><CashSessionPanel canCloseAny={management} session={session} userId={auth.user.id}/></div>;
}
