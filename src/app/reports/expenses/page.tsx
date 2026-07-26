import { CalendarDays, CalendarRange, CircleDollarSign, ListFilter, Trophy } from "lucide-react";

import { ExportActions } from "@/components/reports/ExportActions";
import { ReportBarChart, ReportTrendChart } from "@/components/reports/ReportChart";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportPagination, reportQuery } from "@/components/reports/ReportPagination";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { ReportStatCard } from "@/components/reports/ReportStatCard";
import { ReportTable } from "@/components/reports/ReportTable";
import { getExpenseReport } from "@/features/reports/services/expense-report-service";
import { formatReportMoney } from "@/features/reports/utils/report-formatters";
import { reportPageContext, type ReportSearchParams } from "@/features/reports/utils/report-page-context";

export default async function ExpenseReportPage({ searchParams }: { searchParams: ReportSearchParams }) {
  const context = await reportPageContext(searchParams);
  const report = await getExpenseReport(context.filters, context.range);
  const rows = report.records.map((row) => [row.date, row.title, row.category.replaceAll("_", " "), row.reference ?? "—", row.createdBy, formatReportMoney(row.amount)]);
  return <><ReportPrintHeader range={context.range.label} title="Expense Report" /><ReportHeader description="Recorded operating expenses by date, category, reference, and creator." rangeLabel={context.range.label} title="Expense Report" /><div className="flex justify-end"><ExportActions query={reportQuery(context.filters)} report="expenses" /></div><ReportFilters error={context.error} filters={context.filters} flags={{ search: true, expenseCategory: true }} options={context.options} route="/reports/expenses" /><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><ReportStatCard detail="All recorded expenses today" icon={CircleDollarSign} title="Expenses Today" value={formatReportMoney(report.totals.today)} /><ReportStatCard detail="Monday through today" icon={CalendarRange} title="This Week" value={formatReportMoney(report.totals.week)} /><ReportStatCard detail="Month to date" icon={CalendarDays} title="This Month" value={formatReportMoney(report.totals.month)} /><ReportStatCard detail="Current report filters" icon={ListFilter} title="Filtered Total" value={formatReportMoney(report.totals.filtered)} /><ReportStatCard detail="Highest value in filtered data" icon={Trophy} title="Highest Category" value={report.totals.highestCategory?.replaceAll("_", " ") ?? "No data"} /></section><section className="grid gap-5 xl:grid-cols-2"><ReportTrendChart data={report.timeline} description="Recorded expenses by expense date" title="Expenses Over Time" /><ReportBarChart data={report.categories} description="Filtered expense value by category" title="Expenses by Category" /></section><ReportTable caption="Filtered expense report" headers={["Date", "Title", "Category", "Reference", "Created By", "Amount"]} rows={rows} /><ReportPagination filters={context.filters} page={report.page} route="/reports/expenses" total={report.total} totalPages={report.totalPages} /></>;
}
