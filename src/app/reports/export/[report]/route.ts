import type { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-utils";
import { EXPORT_REPORTS, getExportDataset, type ExportReport } from "@/features/reports/services/report-export-service";
import { REPORT_ACCESS_ROLES } from "@/features/reports/types";
import { createCsv, createXlsx } from "@/features/reports/utils/export-files";
import { safeReportFilename } from "@/features/reports/utils/report-formatters";
import { parseReportFilters } from "@/features/reports/validations/report-filter-schema";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ report: string }> }) {
  await requireRole(REPORT_ACCESS_ROLES as readonly UserRole[]);
  const { report } = await context.params;
  if (!EXPORT_REPORTS.includes(report as ExportReport)) return new Response("Unknown report.", { status: 404 });
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  if (format !== "csv" && format !== "xlsx") return new Response("Choose CSV or Excel format.", { status: 400 });
  const input = Object.fromEntries(url.searchParams.entries());
  const parsed = parseReportFilters(input);
  if (parsed.error) return new Response(parsed.error, { status: 400 });
  try {
    const dataset = await getExportDataset(report as ExportReport, parsed.filters, parsed.range);
    const generated = new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" });
    const filename = safeReportFilename(report, parsed.range.startKey, parsed.range.endKey, format);
    const generatedBody = format === "csv" ? createCsv(dataset, parsed.range.label, generated) : createXlsx(dataset, parsed.range.label, generated);
    let body: BodyInit;
    if (typeof generatedBody === "string") {
      body = generatedBody;
    } else {
      const buffer = new ArrayBuffer(generatedBody.byteLength);
      new Uint8Array(buffer).set(generatedBody);
      body = buffer;
    }
    return new Response(body, { headers: { "Cache-Control": "private, no-store", "Content-Disposition": `attachment; filename="${filename}"`, "Content-Type": format === "csv" ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } });
  } catch (error) {
    console.error("Report export failed", error);
    return new Response("The report export could not be generated. Please try again.", { status: 500 });
  }
}
