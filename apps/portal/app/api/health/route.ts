import { NextResponse } from "next/server";

/**
 * Health check endpoint for monitoring services
 * Returns system status for load balancers, uptime monitors, etc.
 * 
 * GET /api/health
 */
export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      api: "ok",
      // Add more checks as needed:
      // database: await checkDatabase(),
      // cache: await checkCache(),
    },
  };

  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
