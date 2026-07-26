import { Banknote, Calculator, CreditCard, QrCode, ReceiptText, WalletCards } from "lucide-react";

import { ExportActions } from "@/components/reports/ExportActions";
import { ReportPieChart, ReportTrendChart } from "@/components/reports/ReportChart";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { reportQuery } from "@/components/reports/ReportPagination";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { ReportStatCard } from "@/components/reports/ReportStatCard";
import { ReportTable } from "@/components/reports/ReportTable";
import { getPaymentReport } from "@/features/reports/services/payment-report-service";
import { formatReportMoney } from "@/features/reports/utils/report-formatters";
import { reportPageContext, type ReportSearchParams } from "@/features/reports/utils/report-page-context";

export default async function PaymentReportPage({ searchParams }: { searchParams: ReportSearchParams }) {
  const context = await reportPageContext(searchParams);
  const report = await getPaymentReport(context.filters, context.range);
  const method = new Map(report.records.map((row) => [row.method, row]));
  const rows = report.records.map((row) => [row.method, row.count, formatReportMoney(row.revenue), formatReportMoney(row.average), row.method === "CASH" ? formatReportMoney(row.received) : "—", row.method === "CASH" ? formatReportMoney(row.change) : "—"]);
  return <><ReportPrintHeader range={context.range.label} title="Payment Report" /><ReportHeader description="Paid completed-order revenue by approved payment method. Cash tendered is shown separately and is not revenue." rangeLabel={context.range.label} title="Payment Report" /><div className="flex justify-end"><ExportActions query={reportQuery(context.filters)} report="payments" /></div><ReportFilters error={context.error} filters={context.filters} flags={{ cashier: true, orderType: true, paymentMethod: true }} options={context.options} route="/reports/payments" /><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><ReportStatCard detail="Completed cash payment amount owed" icon={Banknote} title="Cash Sales" value={formatReportMoney(method.get("CASH")?.revenue ?? "0")} /><ReportStatCard detail="Completed card payment amount" icon={CreditCard} title="Card Sales" value={formatReportMoney(method.get("CARD")?.revenue ?? "0")} /><ReportStatCard detail="Completed QR payment amount" icon={QrCode} title="QR Sales" value={formatReportMoney(method.get("QR")?.revenue ?? "0")} /><ReportStatCard detail="All approved paid methods" icon={WalletCards} title="Completed Sales" value={formatReportMoney(report.totalRevenue)} /><ReportStatCard detail="Paid payment records" icon={ReceiptText} title="Payment Count" value={String(report.paymentCount)} /><ReportStatCard detail="Revenue ÷ payment count" icon={Calculator} title="Average Payment" value={formatReportMoney(report.averagePayment)} /></section><section className="grid gap-5 xl:grid-cols-2"><ReportPieChart data={report.distribution} description="Revenue owed, not cash received" title="Payment Method Distribution" /><ReportTrendChart data={report.timeline} description="Paid completed-order revenue by date" title="Payment Revenue Over Time" /></section><ReportTable caption="Payment method report" headers={["Method", "Payment Count", "Revenue", "Average", "Cash Received", "Change Given"]} rows={rows} /><p className="rounded-xl bg-muted/60 px-4 py-3 text-xs font-semibold text-muted-foreground">Cash received: {formatReportMoney(report.totalReceived)} · Change given: {formatReportMoney(report.totalChange)}. These tender figures are excluded from revenue.</p></>;
}
