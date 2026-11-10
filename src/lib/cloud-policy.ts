/** Deployment policy; local Windows installations retain their existing behavior. */
export function isCloudDeployment() {
  return process.env.NETLIFY === "true" || Boolean(process.env.VERCEL) || process.env.POS_DEPLOYMENT === "cloud";
}
export function requireLocalBackup() {
  if (isCloudDeployment()) throw new Error("Managed database backups are required in cloud deployments. Use the approved Neon recovery procedure.");
}
