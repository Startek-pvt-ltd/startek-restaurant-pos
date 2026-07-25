import "server-only";

import { getCashierReport } from "./cashier-report-service";
import { getExpenseReport } from "./expense-report-service";
import { getItemReport } from "./item-report-service";
import { getPaymentReport } from "./payment-report-service";
import { getOverviewReport } from "./report-service";
import { getSalesReport } from "./sales-report-service";
import type { ExportDataset, ReportDateRange, ReportFilters } from "../types";
import { formatReportDateTime } from "../utils/report-formatters";

export const EXPORT_REPORTS = ["overview", "sales", "items", "payments", "cashiers", "expenses"] as const;
export type ExportReport = (typeof EXPORT_REPORTS)[number];

export async function getExportDataset(report: ExportReport, filters: ReportFilters, range: ReportDateRange): Promise<ExportDataset> {
  if (report === "overview") {
    const data = await getOverviewReport(filters, range);
    return { title: "Reports Overview", headers: ["Metric", "Value"], rows: [["Gross Sales", Number(data.grossSales)], ["Completed Orders", data.completedOrders], ["Cancelled Orders", data.cancelledOrders], ["Average Order Value", Number(data.averageOrderValue)], ["Discounts", Number(data.discounts)], ["Tax", Number(data.tax)], ["Service Charges", Number(data.serviceCharge)], ["Expenses", Number(data.expenses)], ["Net Sales", Number(data.netSales)], ["Estimated Net Revenue", Number(data.netRevenue)]], totals: [["Estimated Net Revenue", data.netRevenue]] };
  }
  if (report === "sales") {
    const data = await getSalesReport(filters, range, true);
    return { title: "Sales", headers: ["Date", "Invoice", "Cashier", "Order Type", "Payment Method", "Status", "Subtotal", "Discount", "Tax", "Service Charge", "Grand Total"], rows: data.records.map((row) => [formatReportDateTime(row.date), row.invoice, row.cashier, row.orderType, row.paymentMethod ?? "", row.status, Number(row.subtotal), Number(row.discount), Number(row.tax), Number(row.serviceCharge), Number(row.grandTotal)]), totals: [["Completed Gross Sales", data.totals.subtotal], ["Discounts", data.totals.discount], ["Tax", data.totals.tax], ["Service Charges", data.totals.serviceCharge], ["Completed Net Sales", data.totals.grandTotal], ["Cancelled Orders", String(data.totals.cancelledOrders)]], currencyColumns: [6, 7, 8, 9, 10] };
  }
  if (report === "items") {
    const data = await getItemReport(filters, range, true);
    return { title: "Menu Performance", headers: ["Menu Item", "Category", "Quantity Sold", "Revenue", "Average Selling Price", "Percentage of Item Sales"], rows: data.records.map((row) => [row.name, row.category, row.quantity, Number(row.revenue), Number(row.averagePrice), Number(row.percentage)]), totals: [["Quantity Sold", String(data.totalQuantity)], ["Item Revenue", data.totalRevenue], ["Items With No Sales", String(data.noSales.length)]], currencyColumns: [3, 4] };
  }
  if (report === "payments") {
    const data = await getPaymentReport(filters, range);
    return { title: "Payments", headers: ["Payment Method", "Payment Count", "Revenue", "Average Payment", "Cash Received", "Change Given"], rows: data.records.map((row) => [row.method, row.count, Number(row.revenue), Number(row.average), Number(row.received), Number(row.change)]), totals: [["Completed Sales", data.totalRevenue], ["Payment Count", String(data.paymentCount)], ["Average Payment", data.averagePayment], ["Cash Received", data.totalReceived], ["Change Given", data.totalChange]], currencyColumns: [2, 3, 4, 5] };
  }
  if (report === "cashiers") {
    const data = await getCashierReport(filters, range, true);
    return { title: "Cashier Performance", headers: ["Cashier", "Role", "Orders", "Completed", "Cancelled", "Gross Sales", "Discounts", "Average Order", "Last Sale"], rows: data.records.map((row) => [row.name, row.role, row.orders, row.completed, row.cancelled, Number(row.grossSales), Number(row.discounts), Number(row.averageOrderValue), row.lastSale ? formatReportDateTime(row.lastSale) : ""]), totals: [["Cashiers", String(data.total)]], currencyColumns: [5, 6, 7] };
  }
  const data = await getExpenseReport(filters, range, true);
  return { title: "Expenses", headers: ["Date", "Title", "Category", "Reference", "Created By", "Amount"], rows: data.records.map((row) => [row.date, row.title, row.category, row.reference ?? "", row.createdBy, Number(row.amount)]), totals: [["Filtered Expenses", data.totals.filtered], ["Highest Category", data.totals.highestCategory ?? "No data"]], currencyColumns: [5] };
}
