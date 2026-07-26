import { ArrowLeft, CalendarClock, CircleDollarSign, ClipboardList, ReceiptText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StaffRoleBadge, StaffStatusBadge } from "@/components/staff/staff-badges";
import { getStaffDetails } from "@/features/staff/services/staff-service";
import { staffIdSchema } from "@/features/staff/validations/staff-schema";
import { formatMoney } from "@/features/pos/lib/format-money";

function dateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" }) : "Never";
}

export default async function StaffDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const parsed = staffIdSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const data = await getStaffDetails(parsed.data);
  if (!data) notFound();
  const staff = data.staff;
  return <div className="space-y-5 pb-8"><Link className="inline-flex items-center gap-2 text-sm font-black text-secondary transition hover:text-primary focus-visible:ring-2 focus-visible:ring-primary" href="/staff"><ArrowLeft aria-hidden="true" className="size-4" />Back to staff</Link><header className="rounded-3xl bg-secondary p-5 text-white shadow-[0_16px_40px_rgba(74,35,16,0.16)] sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Staff profile</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">{staff.fullName}</h1><p className="mt-1 text-sm text-white/60">@{staff.username}</p></div><div className="flex flex-wrap gap-2"><StaffRoleBadge role={staff.role} /><StaffStatusBadge status={staff.status} /></div></div></header><section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><article className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-black text-secondary">Account information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><Info label="Email" value={staff.email || "Not provided"} /><Info label="Phone" value={staff.phone || "Not provided"} /><Info label="Last login" value={dateTime(staff.lastLogin)} /><Info label="Created" value={dateTime(staff.createdAt)} /><Info label="Last updated" value={dateTime(staff.updatedAt)} /><Info label="Avatar" value={staff.avatar ? "Configured" : "Not configured"} /></dl></article><section aria-label="Staff performance" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><Metric icon={ClipboardList} label="Orders processed" value={String(data.orderCount)} /><Metric icon={ReceiptText} label="Completed orders" value={String(data.completedOrderCount)} /><Metric icon={CircleDollarSign} label="Completed sales" value={formatMoney(Number(data.salesProcessed))} /><Metric icon={CalendarClock} label="Expenses created" value={String(data.expenseCount)} /></section></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-black text-secondary">Recent activity</h2>{data.activities.length ? <ol className="mt-4 divide-y divide-border">{data.activities.map((item) => { const [action = "ACCOUNT_ACTIVITY", , target] = item.action.split(" | "); return <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div><p className="text-sm font-black text-secondary">{action.replaceAll("_", " ")}</p><p className="text-xs text-muted-foreground">{target || "Account activity"} · by {item.actor}</p></div><time className="text-xs font-semibold text-muted-foreground">{dateTime(item.createdAt)}</time></li>; })}</ol> : <p className="mt-4 text-sm text-muted-foreground">No recent activity is recorded for this account.</p>}</section></div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-black text-secondary">{value}</dd></div>; }
function Metric({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: string }) { return <article className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-secondary"><Icon aria-hidden="true" className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-lg font-black text-secondary">{value}</p></div></article>; }
