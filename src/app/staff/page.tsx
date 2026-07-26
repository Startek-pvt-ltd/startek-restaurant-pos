import { StaffFilters } from "@/components/staff/staff-filters";
import { StaffManagementClient } from "@/components/staff/staff-management-client";
import { StaffPagination } from "@/components/staff/staff-pagination";
import { getStaffPage } from "@/features/staff/services/staff-service";
import { staffFiltersSchema } from "@/features/staff/validations/staff-schema";
import { requireAuth } from "@/lib/auth-utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function StaffPage({ searchParams }: { searchParams: SearchParams }) {
  const [session, raw] = await Promise.all([requireAuth(), searchParams]);
  const filters = staffFiltersSchema.parse({ query: first(raw.query) ?? "", role: first(raw.role) || undefined, status: first(raw.status) || undefined, sort: first(raw.sort) ?? "name", page: first(raw.page) ?? "1", pageSize: first(raw.pageSize) ?? "10" });
  const data = await getStaffPage(filters);
  return <div className="space-y-5 pb-8"><StaffManagementClient active={data.active} actorId={session.user.id} actorRole={session.user.role} inactive={data.inactive} staff={data.staff} total={data.total}><StaffFilters filters={filters} /></StaffManagementClient><StaffPagination filters={filters} page={data.page} total={data.total} totalPages={data.totalPages} /></div>;
}
