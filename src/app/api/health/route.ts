import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      {
        status: "healthy",
        database: "connected",
        application: process.env.NEXT_PUBLIC_APP_NAME ?? "Startek Restaurant POS",
        version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unhealthy", database: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
