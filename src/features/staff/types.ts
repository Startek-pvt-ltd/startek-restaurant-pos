import type { UserRole, UserStatus } from "@/generated/prisma/client";

export const APPROVED_STAFF_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"] as const satisfies readonly UserRole[];
export const STAFF_ACCESS_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER"] as const satisfies readonly UserRole[];

export type ApprovedStaffRole = (typeof APPROVED_STAFF_ROLES)[number];
export type StaffSort = "name" | "role" | "newest" | "oldest" | "last-login";

export interface StaffFilters {
  query: string;
  role?: ApprovedStaffRole;
  status?: UserStatus;
  sort: StaffSort;
  page: number;
  pageSize: number;
}

export interface StaffRecord {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: ApprovedStaffRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  id?: string;
}
