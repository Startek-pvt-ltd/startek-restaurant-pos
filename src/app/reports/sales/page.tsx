import { CircleX, Percent, ReceiptText, ShoppingBag, WalletCards } from "lucide-react";

import { ExportActions } from "@/components/reports/ExportActions";
import { ReportBarChart, ReportPieChart, ReportTrendChart } from "@/components/reports/ReportChart";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportPagination, reportQuery } from "@/components/reports/ReportPagination";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { ReportStatCard } from "@/components/reports/ReportStatCard";
import { ReportTable } from "@/components/reports/ReportTable";
import { getSalesReport } from "@/features/reports/services/sales-report-service";
import { formatReportDateTime, formatReportMoney } from "@/features/reports/utils/report-formatters";
import { reportPageContext, type ReportSearchParams } from "@/features/reports/utils/report-page-context";

export default async function SalesReportPage({ searchParams }: { searchParams: ReportSearchParams }) {
  const context = await reportPageContext(searchParams);
  const report = await getSalesReport(context.filters, context.range);
  const rows = report.records.map((row) => [formatReportDateTime(row.date), row.invoice, row.cashier, row.orderType.replaceAll("_", "-"), row.paymentMethod ?? "—", row.status, formatReportMoney(row.subtotal), formatReportMoney(row.discount), formatReportMoney(row.tax), formatReportMoney(row.serviceCharge), formatReportMoney(row.grandTotal)]);
  return <><ReportPrintHeader range={context.range.label} title="Sales Report" /><ReportHeader description="Invoice-level sales with completed revenue totals and separate cancellation metrics." rangeLabel={context.range.label} title="Sales Report" /><div className="flex justify-end"><ExportActions query={reportQuery(context.filters)} report="sales" /></div><ReportFilters error={context.error} filters={context.filters} flags={{ search: true, cashier: true, orderType: true, paymentMethod: true, status: true }} options={context.options} route="/reports/sales" /><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><ReportStatCard detail="Revenue-bearing orders" icon={ShoppingBag} title="Completed Orders" value={String(report.totals.completedOrders)} /><ReportStatCard detail="Excluded from revenue" icon={CircleX} title="Cancelled Orders" value={String(report.totals.cancelledOrders)} /><ReportStatCard detail="Completed subtotals" icon={WalletCards} title="Gross Sales" value={formatReportMoney(report.totals.subtotal)} /><ReportStatCard detail="Completed discounts" icon={Percent} title="Discounts" value={formatReportMoney(report.totals.discount)} /><ReportStatCard detail="Completed grand totals" icon={ReceiptText} title="Net Sales" value={formatReportMoney(report.totals.grandTotal)} /></section><section className="grid gap-5 xl:grid-cols-2"><ReportTrendChart data={report.charts.daily} description="Completed grand totals by business date" title="Daily Sales" /><ReportBarChart data={report.charts.weekly} description="Completed sales grouped by Monday-starting week" title="Weekly Sales" /><ReportBarChart data={report.charts.monthly} description="Completed sales grouped by calendar month" title="Monthly Sales" /><ReportPieChart data={report.charts.orderTypes} description="Completed sales by order type" title="Sales by Order Type" /></section><ReportTable caption="Filtered sales report" headers={["Date", "Invoice", "Cashier", "Order Type", "Payment", "Status", "Subtotal", "Discount", "Tax", "Service", "Grand Total"]} rows={rows} /><ReportPagination filters={context.filters} page={report.page} route="/reports/sales" total={report.total} totalPages={report.totalPages} /></>;
}
