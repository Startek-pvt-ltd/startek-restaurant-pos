import { Prisma } from "@/generated/prisma/client";

type DecimalInput = Prisma.Decimal | string | number | null | undefined;

export function decimal(value: DecimalInput) {
  return new Prisma.Decimal(value ?? 0);
}

export function moneyValue(value: DecimalInput) {
  return decimal(value).toFixed(2);
}

export function formatReportMoney(value: string | number) {
  return `Rs. ${Number(value).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatReportDateTime(value: Date | string) {
  return new Date(value).toLocaleString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" });
}

export function formatReportDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium" });
}

export function safeReportFilename(report: string, start: string, end: string, extension: string) {
  const safeReport = report.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `rice-kottu-hut-${safeReport}-report-${start}-to-${end}.${extension}`;
}

export function chartByDay(rows: Array<{ createdAt: Date; amount: Prisma.Decimal }>) {
  const totals = new Map<string, Prisma.Decimal>();
  for (const row of rows) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(row.createdAt);
    totals.set(key, decimal(totals.get(key)).plus(row.amount));
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value: value.toFixed(2) }));
}
