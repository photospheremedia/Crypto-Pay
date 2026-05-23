import { NextResponse } from "next/server";
import { metricsCollector } from "@/lib/monitoring/metrics-collector";

/**
 * Monitoring Dashboard Endpoint
 * 
 * Returns comprehensive performance metrics for the monitoring dashboard
 * 
 * Includes:
 * - Current metrics snapshot
 * - Recent trend analysis
 * - Active alerts
 * - Performance recommendations
 * 
 * Usage:
 * curl http://localhost:3001/api/metrics/dashboard
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get("range") || "60"); // minutes

    const snapshot = metricsCollector.getSnapshot();
    const recentSamples = metricsCollector.getRecentSamples(timeRange);
    const trends = metricsCollector.getTrends();

    // Calculate statistics from recent samples
    const stats = calculateStats(recentSamples);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      timeRange: `${timeRange} minutes`,
      current: snapshot,
      trends,
      statistics: stats,
      recommendations: generateRecommendations(snapshot, stats, trends),
      health: calculateHealthScore(snapshot, stats),
    });
  } catch (error) {
    console.error("[Monitoring] Dashboard endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitoring data" },
      { status: 500 }
    );
  }
}

/**
 * Calculate aggregate statistics from recent samples
 */
function calculateStats(samples: any[]) {
  if (samples.length === 0) {
    return {
      avgCacheHitRate: 0,
      avgResponseTime: 0,
      maxMemoryUsage: 0,
      totalQueries: 0,
      sampleCount: 0,
    };
  }

  const hitRates = samples.map((s) => s.cacheHitRate);
  const responseTimes = samples.map((s) => s.avgResponseTime);
  const memoryUsages = samples.map((s) => s.memoryUsage);
  const queries = samples.map((s) => s.totalDbQueries);

  return {
    avgCacheHitRate: (hitRates.reduce((a, b) => a + b, 0) / hitRates.length).toFixed(2),
    avgResponseTime: (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2),
    maxMemoryUsage: Math.max(...memoryUsages),
    totalQueries: queries.reduce((a, b) => a + b, 0),
    sampleCount: samples.length,
  };
}

/**
 * Calculate overall health score (0-100)
 */
function calculateHealthScore(snapshot: any, stats: any): number {
  let score = 100;

  // Cache hit rate: target 70%+
  if (snapshot.cacheHitRate < 70) {
    score -= (70 - snapshot.cacheHitRate) * 0.5;
  }

  // Response time: target <100ms
  if (snapshot.avgResponseTime > 100) {
    score -= Math.min(50, (snapshot.avgResponseTime - 100) * 0.1);
  }

  // Memory: target <256MB
  if (snapshot.memoryUsage > 256) {
    score -= Math.min(30, (snapshot.memoryUsage - 256) * 0.05);
  }

  // Database queries: target <100 per sample
  if (snapshot.totalDbQueries > 100) {
    score -= Math.min(20, (snapshot.totalDbQueries - 100) * 0.01);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(snapshot: any, stats: any, trends: any): string[] {
  const recommendations: string[] = [];

  // Cache hit rate recommendations
  if (snapshot.cacheHitRate < 50) {
    recommendations.push("🔴 CRITICAL: Cache hit rate <50%. Check if Realtime invalidation is working.");
  } else if (snapshot.cacheHitRate < 70) {
    recommendations.push("⚠️  Cache hit rate <70%. Consider warming cache on startup or increasing TTL.");
  } else if (snapshot.cacheHitRate > 90) {
    recommendations.push("✅ Excellent cache hit rate!");
  }

  // Response time recommendations
  if (snapshot.avgResponseTime > 500) {
    recommendations.push("⚠️  Response time >500ms. Check database query performance and indexes.");
  }

  // Memory usage recommendations
  if (snapshot.memoryUsage > 512) {
    recommendations.push("🔴 CRITICAL: Memory usage >512MB. Implement cache eviction or increase instance size.");
  } else if (snapshot.memoryUsage > 256) {
    recommendations.push("⚠️  Memory usage >256MB. Monitor for memory leaks.");
  }

  // Trend-based recommendations
  if (trends.hitRateTrend === "↓ decreasing") {
    recommendations.push("📉 Cache hit rate is decreasing. Investigate potential memory pressure or load changes.");
  }

  if (trends.responseTimeTrend === "↑ increasing") {
    recommendations.push("📈 Response time is increasing. Check database load and query performance.");
  }

  // Database query recommendations
  if (snapshot.totalDbQueries > 1000) {
    recommendations.push("⚠️  High query count. Verify cache is working properly.");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ All systems operating normally!");
  }

  return recommendations;
}

/**
 * Dashboard Data Structure:
 * 
 * {
 *   "timestamp": "2026-02-02T10:30:45.123Z",
 *   "timeRange": "60 minutes",
 *   "current": {
 *     "timestamp": 1707124245123,
 *     "cacheHitRate": 73.5,        // percentage
 *     "totalDbQueries": 152,       // in this 5-min sample
 *     "avgResponseTime": 45.2,     // milliseconds
 *     "memoryUsage": 245,          // MB
 *     "realtimeSubscriptions": 12,
 *     "activeUsers": 8
 *   },
 *   "trends": {
 *     "hitRateTrend": "→ stable",
 *     "queryCountTrend": "↓ decreasing",
 *     "responseTimeTrend": "→ stable"
 *   },
 *   "statistics": {
 *     "avgCacheHitRate": "72.15",
 *     "avgResponseTime": "47.82",
 *     "maxMemoryUsage": 312,
 *     "totalQueries": 9152,
 *     "sampleCount": 60
 *   },
 *   "recommendations": [
 *     "✅ All systems operating normally!",
 *     "✅ Excellent cache hit rate!"
 *   ],
 *   "health": {
 *     "score": 92,
 *     "status": "healthy",
 *     "message": "System performing well"
 *   }
 * }
 */
