import { z } from "zod";

import { APPROVED_STAFF_ROLES } from "../types";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || "");
const password = z.string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

const staffFields = {
  fullName: z.string().trim().min(2, "Full name is required.").max(100),
  username: z.string().trim().min(3, "Username must contain at least 3 characters.").max(50).regex(/^[A-Za-z0-9._-]+$/, "Use letters, numbers, dots, underscores, or hyphens only.").transform((value) => value.toLowerCase()),
  email: optionalText(254).refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email address.").transform((value) => value.toLowerCase()),
  phone: optionalText(30).refine((value) => !value || /^\+?[0-9 ()-]{7,20}$/.test(value), "Enter a valid phone number."),
  role: z.enum(APPROVED_STAFF_ROLES),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  avatar: optionalText(500).refine((value) => !value || z.string().url().safeParse(value).success || value.startsWith("/"), "Enter a valid avatar URL."),
};

export const createStaffSchema = z.object({
  ...staffFields,
  password,
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export const editStaffSchema = z.object(staffFields);
export const staffIdSchema = z.string().uuid();
export const staffStatusSchema = z.object({ id: staffIdSchema, status: z.enum(["ACTIVE", "INACTIVE"]) });
export const resetStaffPasswordSchema = z.object({ id: staffIdSchema, password, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export const staffFiltersSchema = z.object({
  query: z.string().trim().max(100).catch(""),
  role: z.enum(APPROVED_STAFF_ROLES).optional().catch(undefined),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().catch(undefined),
  sort: z.enum(["name", "role", "newest", "oldest", "last-login"]).catch("name"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().refine((value) => [10, 20, 50].includes(value)).catch(10),
});

export const profileSchema = z.object({
  fullName: staffFields.fullName,
  email: staffFields.email,
  phone: staffFields.phone,
  avatar: staffFields.avatar,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: password,
  confirmPassword: z.string(),
}).refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type EditStaffInput = z.infer<typeof editStaffSchema>;
export type ResetStaffPasswordInput = z.infer<typeof resetStaffPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
