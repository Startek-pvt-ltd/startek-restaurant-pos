import { PrismaPg } from "@prisma/adapter-pg";
import { isCloudDeployment } from "@/lib/cloud-policy";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const databaseUrl = new URL(connectionString);
if (isCloudDeployment() && ["require", "verify-ca", "prefer"].includes(databaseUrl.searchParams.get("sslmode") ?? "")) {
  databaseUrl.searchParams.set("sslmode", "verify-full");
}
const adapter = new PrismaPg({ connectionString: databaseUrl.toString(), max: 3, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000 });
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
