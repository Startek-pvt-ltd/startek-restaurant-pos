import { Search, X } from "lucide-react";
import Link from "next/link";

import { APPROVED_STAFF_ROLES, type StaffFilters as Filters } from "@/features/staff/types";

const fieldClass = "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm font-semibold text-secondary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

export function StaffFilters({ filters }: { filters: Filters }) {
  return <form className="rounded-2xl border border-border bg-card p-4 shadow-sm" method="get"><h2 className="sr-only">Staff filters</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
    <label className="relative md:col-span-2"><span className="sr-only">Search staff</span><Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className={`${fieldClass} pl-10`} defaultValue={filters.query} maxLength={100} name="query" placeholder="Search name, username, email, or phone…" type="search" /></label>
    <label><span className="sr-only">Role</span><select className={fieldClass} defaultValue={filters.role ?? ""} name="role"><option value="">All roles</option>{APPROVED_STAFF_ROLES.map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select></label>
    <label><span className="sr-only">Status</span><select className={fieldClass} defaultValue={filters.status ?? ""} name="status"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
    <label><span className="sr-only">Sort staff</span><select className={fieldClass} defaultValue={filters.sort} name="sort"><option value="name">Name A–Z</option><option value="role">Role</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="last-login">Last login</option></select></label>
    <label><span className="sr-only">Rows per page</span><select className={fieldClass} defaultValue={filters.pageSize} name="pageSize"><option value="10">10 per page</option><option value="20">20 per page</option><option value="50">50 per page</option></select></label>
    <div className="flex gap-2 md:col-span-2 xl:col-span-6 xl:justify-end"><button className="h-11 flex-1 rounded-xl bg-secondary px-5 text-sm font-black text-white transition hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary md:flex-none" type="submit">Apply filters</button><Link aria-label="Clear staff filters" className="flex size-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary" href="/staff"><X aria-hidden="true" className="size-4" /></Link></div>
  </div></form>;
}
