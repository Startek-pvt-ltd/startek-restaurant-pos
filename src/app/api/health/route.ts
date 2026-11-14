import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { healthFailureEvent, newRequestId } from "@/lib/operational-events";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const requestId = newRequestId();
  const timestamp = new Date().toISOString();
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        version,
        timestamp,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Request-ID": requestId,
        },
      }
    );
  } catch {
    // Avoid serializing underlying pg errors: they can include internal hosts.
    console.error(healthFailureEvent(requestId, Date.now() - startedAt));
    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
        version,
        timestamp,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Request-ID": requestId,
        },
      }
    );
  }
}
