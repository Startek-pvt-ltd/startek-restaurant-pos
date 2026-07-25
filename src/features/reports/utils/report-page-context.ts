import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-utils";

import { getReportFilterOptions } from "../services/report-service";
import { REPORT_ACCESS_ROLES } from "../types";
import { parseReportFilters, searchParamsInput } from "../validations/report-filter-schema";

export type ReportSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function reportPageContext(searchParams: ReportSearchParams) {
  const [raw, options] = await Promise.all([searchParams, getReportFilterOptions(), requireRole(REPORT_ACCESS_ROLES as readonly UserRole[])]);
  return { ...parseReportFilters(searchParamsInput(raw)), options };
}
