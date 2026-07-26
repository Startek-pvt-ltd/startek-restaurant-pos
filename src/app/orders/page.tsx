import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";

import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrderPagination } from "@/components/orders/OrderPagination";
import { OrderStatistics } from "@/components/orders/OrderStatistics";
import { OrdersTable } from "@/components/orders/OrdersTable";
import type { UserRole } from "@/generated/prisma/client";
import { getOrdersPage } from "@/features/orders/services/order-service";
import { ORDER_CANCEL_ROLES } from "@/features/orders/types";
import { orderFiltersSchema } from "@/features/orders/validations/order";
import { hasRole, requireAuth } from "@/lib/auth-utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const [session, raw] = await Promise.all([requireAuth(), searchParams]);
  const filters = orderFiltersSchema.parse({
    query: first(raw.query) ?? "",
    dateFrom: first(raw.dateFrom) || undefined,
    dateTo: first(raw.dateTo) || undefined,
    orderType: first(raw.orderType) || undefined,
    paymentMethod: first(raw.paymentMethod) || undefined,
    paymentStatus: first(raw.paymentStatus) || undefined,
    status: first(raw.status) || undefined,
    sort: first(raw.sort) ?? "newest",
    page: first(raw.page) ?? "1",
    pageSize: first(raw.pageSize) ?? "10",
  });
  const data = await getOrdersPage(filters);
  const canCancel = hasRole(session.user.role, ORDER_CANCEL_ROLES as readonly UserRole[]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><ClipboardList aria-hidden="true" className="size-4" />Order management</div><h1 className="mt-2 text-2xl font-black tracking-tight text-secondary sm:text-3xl">Orders</h1><p className="mt-1 text-sm text-muted-foreground">Search invoices, review payments, and manage order status.</p></div><Link className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-secondary shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e8aa00] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href="/pos"><Plus aria-hidden="true" className="size-4.5" />New order</Link></header>
      <OrderStatistics statistics={data.statistics} />
      <OrderFilters filters={filters} />
      <OrdersTable canCancel={canCancel} orders={data.orders} />
      <OrderPagination filters={filters} total={data.total} totalPages={data.totalPages} />
    </div>
  );
}
