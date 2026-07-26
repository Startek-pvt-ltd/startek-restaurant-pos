import type { UserRole } from "@/generated/prisma/client";import { BACKUP_CREATE_ROLES,BACKUP_DELETE_ROLES,BACKUP_RESTORE_ROLES,BACKUP_VIEW_ROLES,DATA_EXPORT_ROLES } from "../types";
export const canViewBackups=(role:UserRole)=>BACKUP_VIEW_ROLES.includes(role);
export const canCreateBackup=(role:UserRole)=>BACKUP_CREATE_ROLES.includes(role);
export const canDeleteBackup=(role:UserRole)=>BACKUP_DELETE_ROLES.includes(role);
export const canRestoreBackup=(role:UserRole)=>BACKUP_RESTORE_ROLES.includes(role);
export const canExportData=(role:UserRole)=>DATA_EXPORT_ROLES.includes(role);
