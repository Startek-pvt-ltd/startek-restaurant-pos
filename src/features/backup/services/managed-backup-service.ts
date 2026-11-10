import "server-only";
const unavailable = () => { throw new Error("Managed database backups are required in cloud deployments. Use the approved Neon recovery procedure."); };
export const backupDirectory: typeof import("./local-backup-service").backupDirectory = unavailable;
export const checkedBackupPath: typeof import("./local-backup-service").checkedBackupPath = unavailable;
export const createFullBackup: typeof import("./local-backup-service").createFullBackup = unavailable;
export const getBackupDashboard: typeof import("./local-backup-service").getBackupDashboard = unavailable;
export const resolveBackupForDownload: typeof import("./local-backup-service").resolveBackupForDownload = unavailable;
export const deleteBackup: typeof import("./local-backup-service").deleteBackup = unavailable;
export const getCompletedBackups: typeof import("./local-backup-service").getCompletedBackups = unavailable;
