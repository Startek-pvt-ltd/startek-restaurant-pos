import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseHeader } from "@/components/expenses/ExpenseHeader";
import { ExpensePagination } from "@/components/expenses/ExpensePagination";
import { ExpenseStatistics } from "@/components/expenses/ExpenseStatistics";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { getExpensesPage } from "@/features/expenses/services/expense-service";
import {
  EXPENSE_ACCESS_ROLES,
  EXPENSE_DELETE_ROLES,
} from "@/features/expenses/types";
import { expenseFiltersSchema } from "@/features/expenses/validations/expense-schema";
import type { UserRole } from "@/generated/prisma/client";
import { hasRole, requireRole } from "@/lib/auth-utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExpensesPage({ searchParams }: { searchParams: SearchParams }) {
  const [session, raw] = await Promise.all([
    requireRole(EXPENSE_ACCESS_ROLES as readonly UserRole[]),
    searchParams,
  ]);
  const input = {
    query: first(raw.query) ?? "",
    category: first(raw.category) || undefined,
    dateFrom: first(raw.dateFrom) || undefined,
    dateTo: first(raw.dateTo) || undefined,
    sort: first(raw.sort) ?? "newest",
    page: first(raw.page) ?? "1",
    pageSize: first(raw.pageSize) ?? "10",
  };
  const parsed = expenseFiltersSchema.safeParse(input);
  const filterError = parsed.success
    ? undefined
    : parsed.error.issues[0]?.message ?? "The selected filters are invalid.";
  const filters = parsed.success
    ? parsed.data
    : expenseFiltersSchema.parse({ ...input, dateFrom: undefined, dateTo: undefined });
  const data = await getExpensesPage(filters);
  const canDelete = hasRole(
    session.user.role,
    EXPENSE_DELETE_ROLES as readonly UserRole[],
  );

  return (
    <div className="space-y-5 pb-8">
      <ExpenseHeader />
      <ExpenseStatistics statistics={data.statistics} />
      <ExpenseFilters error={filterError} filters={filters} />
      <ExpenseTable canDelete={canDelete} expenses={data.expenses} />
      <ExpensePagination
        filters={filters}
        page={data.page}
        total={data.total}
        totalPages={data.totalPages}
      />
    </div>
  );
}
