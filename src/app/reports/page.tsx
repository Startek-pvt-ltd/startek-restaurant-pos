import { BadgeDollarSign, Banknote, CircleDollarSign, CircleX, Percent, ReceiptText, ShoppingBag, TrendingUp, WalletCards } from "lucide-react";

import { ExportActions } from "@/components/reports/ExportActions";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportPieChart, ReportTrendChart } from "@/components/reports/ReportChart";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { ReportStatCard } from "@/components/reports/ReportStatCard";
import { getOverviewReport } from "@/features/reports/services/report-service";
import { formatReportMoney } from "@/features/reports/utils/report-formatters";
import { reportPageContext, type ReportSearchParams } from "@/features/reports/utils/report-page-context";
import { reportQuery } from "@/components/reports/ReportPagination";

export default async function ReportsPage({ searchParams }: { searchParams: ReportSearchParams }) {
  const context = await reportPageContext(searchParams);
  const report = await getOverviewReport(context.filters, context.range);
  const cards = [
    ["Gross Sales", formatReportMoney(report.grossSales), "Completed subtotals before discounts", WalletCards],
    ["Completed Orders", String(report.completedOrders), "Orders included in revenue", ShoppingBag],
    ["Cancelled Orders", String(report.cancelledOrders), "Excluded from all revenue", CircleX],
    ["Average Order Value", formatReportMoney(report.averageOrderValue), "Completed net sales ÷ completed orders", TrendingUp],
    ["Discounts Given", formatReportMoney(report.discounts), "Completed order discounts", Percent],
    ["Tax Collected", formatReportMoney(report.tax), "Recorded completed-order tax", ReceiptText],
    ["Service Charges", formatReportMoney(report.serviceCharge), "Recorded completed-order service charges", Banknote],
    ["Total Expenses", formatReportMoney(report.expenses), "Recorded expenses in this range", CircleDollarSign],
    ["Estimated Net Revenue", formatReportMoney(report.netRevenue), "Net sales minus recorded expenses", BadgeDollarSign],
  ] as const;
  return <><ReportPrintHeader range={context.range.label} title="Reports Overview" /><ReportHeader description="Real sales and expense analytics from PostgreSQL. Cancelled orders remain visible but never count as revenue." rangeLabel={context.range.label} title="Reports Overview" /><div className="flex justify-end"><ExportActions query={reportQuery(context.filters)} report="overview" /></div><ReportFilters error={context.error} filters={context.filters} flags={{ cashier: true, orderType: true, paymentMethod: true, status: true }} options={context.options} route="/reports" /><section aria-label="Report summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">{cards.map(([title, value, detail, icon]) => <ReportStatCard detail={detail} icon={icon} key={title} title={title} value={value} />)}</section><section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]"><ReportTrendChart data={report.dailySales} description="Completed grand totals grouped by Colombo business date" title="Sales Over Time" /><ReportPieChart data={report.orderTypes} description="Completed revenue split by approved order type" title="Sales by Order Type" /></section><section className="rounded-2xl border border-primary/30 bg-primary/10 p-5"><h2 className="font-black text-secondary">Profit summary</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><div><dt className="text-xs font-bold text-muted-foreground">Gross Sales</dt><dd className="mt-1 font-black">{formatReportMoney(report.grossSales)}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Discounts</dt><dd className="mt-1 font-black">{formatReportMoney(report.discounts)}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Net Sales</dt><dd className="mt-1 font-black">{formatReportMoney(report.netSales)}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Expenses</dt><dd className="mt-1 font-black">{formatReportMoney(report.expenses)}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Estimated Net Revenue</dt><dd className="mt-1 font-black">{formatReportMoney(report.netRevenue)}</dd></div></dl><p className="mt-4 text-xs font-semibold text-muted-foreground">Net Revenue is calculated from recorded sales minus recorded expenses. It is not accounting profit and excludes unrecorded costs, depreciation, and accounting adjustments.</p></section></>;
}
