import { NextResponse } from "next/server";
import { getTenantContextCacheStats } from "@/lib/tenant-context";

/**
 * Cache Monitoring Endpoint
 * 
 * Returns real-time cache statistics for monitoring and debugging
 * Available metrics:
 * - cacheSize: number of cached entries
 * - activeSubscriptions: number of active Realtime subscriptions
 * - entries: array of individual cache entry details (key, age, TTL)
 * 
 * Usage:
 * curl http://localhost:3001/api/cache-monitoring
 * 
 * Expected Response:
 * {
 *   "status": "ok",
 *   "timestamp": "2026-02-02T10:30:45.123Z",
 *   "cacheStats": {
 *     "cacheSize": 5,
 *     "activeSubscriptions": 3,
 *     "entries": [
 *       {
 *         "key": "tenant:550e8400-e29b-41d4-a716-446655440000:acme",
 *         "age": 45000,
 *         "ttl": 300000
 *       }
 *     ]
 *   },
 *   "metrics": {
 *     "estimatedMemoryUsage": "10.2 KB",
 *     "cacheHitEstimate": "73%",
 *     "averageEntryAge": 152000
 *   }
 * }
 */

export async function GET(request: Request) {
  try {
    const stats = getTenantContextCacheStats();
    
    // Calculate derived metrics
    const estimatedMemoryPerEntry = 2048; // ~2KB per entry (rough estimate)
    const estimatedMemoryUsage = (stats.cacheSize * estimatedMemoryPerEntry) / 1024 / 1024;
    
    // Calculate average entry age
    const averageEntryAge = stats.entries.length > 0
      ? stats.entries.reduce((sum, entry) => sum + entry.age, 0) / stats.entries.length
      : 0;

    // Estimate cache hit rate based on entries and freshness
    // Entries that are newer than 1/5 of TTL likely indicate cache hits
    const freshEntries = stats.entries.filter(e => e.age < e.ttl / 5).length;
    const cacheHitEstimate = stats.entries.length > 0
      ? ((freshEntries / stats.entries.length) * 100).toFixed(1)
      : "0";

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      cacheStats: stats,
      metrics: {
        estimatedMemoryUsage: `${estimatedMemoryUsage.toFixed(2)} MB`,
        cacheHitEstimate: `${cacheHitEstimate}%`,
        averageEntryAge: Math.round(averageEntryAge),
        entriesCount: stats.entries.length,
        subscriptionsActive: stats.activeSubscriptions,
      },
      recommendations: generateRecommendations(stats, parseInt(cacheHitEstimate)),
    });
  } catch (error) {
    console.error("[Cache Monitoring] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to retrieve cache statistics" },
      { status: 500 }
    );
  }
}

/**
 * Generate performance recommendations based on cache stats
 */
function generateRecommendations(
  stats: ReturnType<typeof getTenantContextCacheStats>,
  hitRate: number
): string[] {
  const recommendations: string[] = [];

  // Hit rate recommendations
  if (hitRate < 50) {
    recommendations.push(
      "⚠️ Low cache hit rate. Consider increasing TTL or warming cache on app startup"
    );
  } else if (hitRate > 85) {
    recommendations.push("✅ Excellent cache hit rate");
  }

  // Cache size recommendations
  if (stats.cacheSize > 10000) {
    recommendations.push("⚠️ Large cache size. Consider implementing LRU eviction");
  } else if (stats.cacheSize < 10) {
    recommendations.push(
      "ℹ️ Small cache size. Cache may not be effective for high-traffic scenarios"
    );
  }

  // Subscription recommendations
  if (stats.activeSubscriptions === 0 && stats.cacheSize > 0) {
    recommendations.push(
      "⚠️ No active Realtime subscriptions. Cache invalidation may be stale"
    );
  }

  return recommendations;
}

/**
 * Cache Monitoring Dashboard Helper
 * 
 * Next Steps:
 * 1. Call this endpoint regularly (every 5 minutes)
 * 2. Log metrics to monitoring service (DataDog, New Relic, etc.)
 * 3. Alert if hit rate drops below 50%
 * 4. Alert if memory usage exceeds 50 MB
 * 
 * Example: Monitor script
 * 
 * const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes
 * setInterval(async () => {
 *   const response = await fetch('/api/cache-monitoring');
 *   const data = await response.json();
 *   
 *   // Send to monitoring service
 *   await sendToDataDog({
 *     metric: 'cache.hit_rate',
 *     value: parseInt(data.metrics.cacheHitEstimate),
 *     tags: ['environment:production']
 *   });
 * }, MONITORING_INTERVAL);
 */
