import type { BackupStatus, BackupType, UserRole } from "@/generated/prisma/client";
export const BACKUP_VIEW_ROLES: readonly UserRole[]=["SUPER_ADMIN","OWNER","MANAGER"];
export const BACKUP_CREATE_ROLES: readonly UserRole[]=["SUPER_ADMIN","OWNER"];
export const BACKUP_DELETE_ROLES: readonly UserRole[]=["SUPER_ADMIN","OWNER"];
export const BACKUP_RESTORE_ROLES: readonly UserRole[]=["SUPER_ADMIN"];
export const DATA_EXPORT_ROLES: readonly UserRole[]=["SUPER_ADMIN","OWNER","MANAGER"];
export type BackupRow={id:string;fileName:string;backupType:BackupType;status:BackupStatus;fileSize:number|null;checksum:string|null;createdBy:string;createdAt:string;completedAt:string|null;failureReason:string|null;databaseVersion:string|null;applicationVersion:string};
export type BackupActionResult={success:boolean;message:string};
