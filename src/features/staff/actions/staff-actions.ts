"use server";

import { revalidatePath } from "next/cache";

import type { UserRole } from "@/generated/prisma/client";
import { hasRole, requireAuth } from "@/lib/auth-utils";

import { changeOwnPassword, changeStaffStatus, createStaff, resetStaffPassword, updateProfile, updateStaff } from "../services/staff-service";
import { STAFF_ACCESS_ROLES, type StaffActionResult } from "../types";
import { changePasswordSchema, createStaffSchema, editStaffSchema, profileSchema, resetStaffPasswordSchema, staffIdSchema, staffStatusSchema } from "../validations/staff-schema";

function validationFailure(error: { flatten: () => { fieldErrors: Record<string, string[]> } }, message: string): StaffActionResult {
  return { success: false, message, fieldErrors: error.flatten().fieldErrors };
}

function actionError(error: unknown, fallback: string): StaffActionResult {
  const message = error instanceof Error ? error.message : "";
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const messages: Record<string, string> = {
    STAFF_ACCESS_DENIED: "Your active account does not have staff administration access.",
    STAFF_ROLE_DENIED: "You cannot create or modify that role.",
    STAFF_NOT_FOUND: "This staff account no longer exists.",
    STAFF_USERNAME_EXISTS: "That username is already in use.",
    STAFF_EMAIL_EXISTS: "That email address is already in use.",
    STAFF_SELF_RESTRICTION: "You cannot deactivate your own account or change your own role here.",
    STAFF_LAST_SUPER_ADMIN: "The last active super admin cannot be deactivated.",
    STAFF_LAST_OWNER: "The last active owner cannot be deactivated. Create or activate another owner first.",
    PROFILE_ACCESS_DENIED: "Your active profile could not be accessed.",
    PROFILE_CURRENT_PASSWORD_INVALID: "The current password is incorrect.",
    PROFILE_PASSWORD_CONFLICT: "Your password changed in another session. Sign in again before retrying.",
  };
  if (messages[message]) return { success: false, message: messages[message] };
  if (code === "P2002") return { success: false, message: "That username or email address is already in use." };
  if (code === "P2034") return { success: false, message: "Another staff change happened at the same time. Please retry." };
  console.error(fallback, error);
  return { success: false, message: fallback };
}

async function staffSession() {
  const session = await requireAuth();
  if (!hasRole(session.user.role, STAFF_ACCESS_ROLES as readonly UserRole[])) return null;
  return session;
}

export async function createStaffAction(input: unknown): Promise<StaffActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, message: "You do not have permission to create staff accounts." };
  const parsed = createStaffSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error, "Please correct the highlighted staff fields.");
  try {
    const user = await createStaff(parsed.data, session.user.id);
    revalidatePath("/staff");
    return { success: true, message: "Staff account created successfully.", id: user.id };
  } catch (error) {
    return actionError(error, "The staff account could not be created. Please try again.");
  }
}

export async function updateStaffAction(id: unknown, input: unknown): Promise<StaffActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, message: "You do not have permission to edit staff accounts." };
  const parsedId = staffIdSchema.safeParse(id);
  const parsed = editStaffSchema.safeParse(input);
  if (!parsedId.success) return { success: false, message: "Invalid staff account." };
  if (!parsed.success) return validationFailure(parsed.error, "Please correct the highlighted staff fields.");
  try {
    await updateStaff(parsedId.data, parsed.data, session.user.id);
    revalidatePath("/staff");
    revalidatePath(`/staff/${parsedId.data}`);
    return { success: true, message: "Staff account updated successfully." };
  } catch (error) {
    return actionError(error, "The staff account could not be updated. Please try again.");
  }
}

export async function changeStaffStatusAction(id: unknown, status: unknown): Promise<StaffActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, message: "You do not have permission to change staff status." };
  const parsed = staffStatusSchema.safeParse({ id, status });
  if (!parsed.success) return { success: false, message: "Invalid staff status request." };
  try {
    await changeStaffStatus(parsed.data.id, parsed.data.status, session.user.id);
    revalidatePath("/staff");
    revalidatePath(`/staff/${parsed.data.id}`);
    return { success: true, message: parsed.data.status === "ACTIVE" ? "Staff account activated." : "Staff account deactivated and its sessions revoked." };
  } catch (error) {
    return actionError(error, "The staff status could not be changed. Please try again.");
  }
}

export async function resetStaffPasswordAction(input: unknown): Promise<StaffActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, message: "You do not have permission to reset this password." };
  const parsed = resetStaffPasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error, "Please correct the password fields.");
  try {
    await resetStaffPassword(parsed.data, session.user.id);
    revalidatePath(`/staff/${parsed.data.id}`);
    return { success: true, message: "Password reset successfully. Existing sessions were revoked." };
  } catch (error) {
    return actionError(error, "The password could not be reset. Please try again.");
  }
}

export async function updateProfileAction(input: unknown): Promise<StaffActionResult> {
  const session = await requireAuth();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error, "Please correct the highlighted profile fields.");
  try {
    await updateProfile(parsed.data, session.user.id);
    revalidatePath("/settings/profile");
    revalidatePath("/dashboard", "layout");
    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    return actionError(error, "Your profile could not be updated. Please try again.");
  }
}

export async function changeOwnPasswordAction(input: unknown): Promise<StaffActionResult> {
  const session = await requireAuth();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error, "Please correct the password fields.");
  try {
    await changeOwnPassword(parsed.data, session.user.id);
    return { success: true, message: "Password changed successfully. Sign in again to continue." };
  } catch (error) {
    return actionError(error, "Your password could not be changed. Please try again.");
  }
}
