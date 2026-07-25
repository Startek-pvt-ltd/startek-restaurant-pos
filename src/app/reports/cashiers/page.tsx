import { CircleX, ReceiptText, TrendingUp, UsersRound } from "lucide-react";

import { ExportActions } from "@/components/reports/ExportActions";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportPagination, reportQuery } from "@/components/reports/ReportPagination";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { ReportStatCard } from "@/components/reports/ReportStatCard";
import { ReportTable } from "@/components/reports/ReportTable";
import { getCashierReport } from "@/features/reports/services/cashier-report-service";
import { formatReportDateTime, formatReportMoney } from "@/features/reports/utils/report-formatters";
import { reportPageContext, type ReportSearchParams } from "@/features/reports/utils/report-page-context";

export default async function CashierReportPage({ searchParams }: { searchParams: ReportSearchParams }) {
  const context = await reportPageContext(searchParams);
  const report = await getCashierReport(context.filters, context.range);
  const rows = report.records.map((row) => [row.name, row.role.replaceAll("_", " "), row.orders, row.completed, row.cancelled, formatReportMoney(row.grossSales), formatReportMoney(row.discounts), formatReportMoney(row.averageOrderValue), row.lastSale ? formatReportDateTime(row.lastSale) : "—"]);
  const completed = report.records.reduce((sum, row) => sum + row.completed, 0);
  const cancelled = report.records.reduce((sum, row) => sum + row.cancelled, 0);
  return <><ReportPrintHeader range={context.range.label} title="Cashier Performance Report" /><ReportHeader description="Operational order performance without passwords, sessions, email addresses, or other sensitive user data." rangeLabel={context.range.label} title="Cashier Performance" /><div className="flex justify-end"><ExportActions query={reportQuery(context.filters)} report="cashiers" /></div><ReportFilters error={context.error} filters={context.filters} flags={{ cashier: true, orderType: true, paymentMethod: true, status: true }} options={context.options} route="/reports/cashiers" /><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><ReportStatCard detail="Cashiers matching filters" icon={UsersRound} title="Cashiers" value={String(report.total)} /><ReportStatCard detail="Revenue-bearing orders on this page" icon={ReceiptText} title="Completed Orders" value={String(completed)} /><ReportStatCard detail="Excluded from sales totals" icon={CircleX} title="Cancelled Orders" value={String(cancelled)} /><ReportStatCard detail="Completed net revenue shown below" icon={TrendingUp} title="Performance Basis" value="Completed sales" /></section><ReportTable caption="Cashier performance" headers={["Cashier", "Role", "Orders", "Completed", "Cancelled", "Gross Sales", "Discounts", "Average Order", "Last Sale"]} rows={rows} /><ReportPagination filters={context.filters} page={report.page} route="/reports/cashiers" total={report.total} totalPages={report.totalPages} /></>;
}
