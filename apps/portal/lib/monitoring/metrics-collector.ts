/**
 * Phase 4: Automated Monitoring & Alerting
 * 
 * Purpose: Continuously monitor cache performance and alert on anomalies
 * Metrics collected:
 * - Cache hit/miss rates
 * - Database query counts
 * - Memory usage
 * - Response times
 * - Realtime subscription health
 * 
 * Implementation:
 * - Metrics collection via edge functions
 * - Time-series storage in Supabase (analytics bucket)
 * - Real-time alerts via webhooks (Slack, email)
 * - Public dashboard for visualization
 */

interface MetricsSample {
  timestamp: number;
  cacheHitRate: number;
  totalDbQueries: number;
  avgResponseTime: number;
  memoryUsage: number;
  realtimeSubscriptions: number;
  activeUsers: number;
}

interface Alert {
  type: "warning" | "critical";
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
}

/**
 * Global metrics collector
 * Tracks performance metrics across all requests
 */
class MetricsCollector {
  private samples: MetricsSample[] = [];
  private dbQueryCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private responseTimes: number[] = [];
  private lastFlushTime = Date.now();

  /**
   * Record a cache hit
   */
  recordCacheHit() {
    this.cacheHits++;
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss() {
    this.cacheMisses++;
  }

  /**
   * Record a database query
   */
  recordDbQuery() {
    this.dbQueryCount++;
  }

  /**
   * Record response time in milliseconds
   */
  recordResponseTime(ms: number) {
    this.responseTimes.push(ms);
  }

  /**
   * Get current metrics snapshot
   */
  getSnapshot(): MetricsSample {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        : 0;

    return {
      timestamp: Date.now(),
      cacheHitRate: Math.round(hitRate * 100) / 100,
      totalDbQueries: this.dbQueryCount,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      memoryUsage: getProcessMemoryUsage(),
      realtimeSubscriptions: getActiveSubscriptionCount(),
      activeUsers: getActiveUserCount(),
    };
  }

  /**
   * Flush metrics to storage (every 5 minutes)
   */
  async flush() {
    const snapshot = this.getSnapshot();
    this.samples.push(snapshot);

    // Only keep last 24 hours of data in memory
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.samples = this.samples.filter((s) => s.timestamp > twentyFourHoursAgo);

    // Send to analytics backend
    await sendToAnalytics(snapshot);

    // Check thresholds and send alerts if needed
    await checkAlerts(snapshot);

    // Reset counters
    this.dbQueryCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.responseTimes = [];
    this.lastFlushTime = Date.now();
  }

  /**
   * Get recent samples for dashboard
   */
  getRecentSamples(minutes: number = 60): MetricsSample[] {
    const cutoffTime = Date.now() - minutes * 60 * 1000;
    return this.samples.filter((s) => s.timestamp > cutoffTime);
  }

  /**
   * Get trend analysis
   */
  getTrends() {
    const recentSamples = this.getRecentSamples(60);

    if (recentSamples.length === 0) {
      return {
        hitRateTrend: "stable",
        queryCountTrend: "stable",
        responseTimeTrend: "stable",
      };
    }

    const hitRates = recentSamples.map((s) => s.cacheHitRate);
    const queryChanges = recentSamples.map((s) => s.totalDbQueries);
    const responseTimes = recentSamples.map((s) => s.avgResponseTime);

    const getChange = (values: number[]) => {
      if (values.length < 2) return "stable";
      const first = values[0];
      const last = values[values.length - 1];
      const change = ((last - first) / first) * 100;

      if (change > 5) return "↑ increasing";
      if (change < -5) return "↓ decreasing";
      return "→ stable";
    };

    return {
      hitRateTrend: getChange(hitRates),
      queryCountTrend: getChange(queryChanges),
      responseTimeTrend: getChange(responseTimes),
    };
  }
}

// Global metrics instance
export const metricsCollector = new MetricsCollector();

/**
 * Setup automatic metrics flushing
 * Call this once on app startup
 */
export function setupAutomaticMetricsFlushing() {
  // Flush metrics every 5 minutes
  setInterval(async () => {
    try {
      await metricsCollector.flush();
    } catch (error) {
      console.error("[Metrics] Flush failed:", error);
    }
  }, 5 * 60 * 1000);

  console.log("[Metrics] Automatic flushing enabled (every 5 minutes)");
}

/**
 * Check performance thresholds and send alerts
 */
async function checkAlerts(sample: MetricsSample) {
  const alerts: Alert[] = [];

  // Alert thresholds
  const THRESHOLDS = {
    LOW_HIT_RATE: 50, // % - Alert if below 50%
    HIGH_RESPONSE_TIME: 500, // ms - Alert if above 500ms
    HIGH_MEMORY_USAGE: 512, // MB - Alert if above 512MB
    HIGH_QUERY_COUNT: 1000, // queries per sample - Alert if above 1000
  };

  if (sample.cacheHitRate < THRESHOLDS.LOW_HIT_RATE) {
    alerts.push({
      type: "warning",
      message: `Cache hit rate dropped below ${THRESHOLDS.LOW_HIT_RATE}%`,
      metric: "cacheHitRate",
      value: sample.cacheHitRate,
      threshold: THRESHOLDS.LOW_HIT_RATE,
      timestamp: sample.timestamp,
    });
  }

  if (sample.avgResponseTime > THRESHOLDS.HIGH_RESPONSE_TIME) {
    alerts.push({
      type: "warning",
      message: `Average response time exceeded ${THRESHOLDS.HIGH_RESPONSE_TIME}ms`,
      metric: "avgResponseTime",
      value: sample.avgResponseTime,
      threshold: THRESHOLDS.HIGH_RESPONSE_TIME,
      timestamp: sample.timestamp,
    });
  }

  if (sample.memoryUsage > THRESHOLDS.HIGH_MEMORY_USAGE) {
    alerts.push({
      type: "critical",
      message: `Memory usage exceeded ${THRESHOLDS.HIGH_MEMORY_USAGE}MB`,
      metric: "memoryUsage",
      value: sample.memoryUsage,
      threshold: THRESHOLDS.HIGH_MEMORY_USAGE,
      timestamp: sample.timestamp,
    });
  }

  if (sample.totalDbQueries > THRESHOLDS.HIGH_QUERY_COUNT) {
    alerts.push({
      type: "warning",
      message: `Database query count exceeded ${THRESHOLDS.HIGH_QUERY_COUNT}`,
      metric: "totalDbQueries",
      value: sample.totalDbQueries,
      threshold: THRESHOLDS.HIGH_QUERY_COUNT,
      timestamp: sample.timestamp,
    });
  }

  // Send alerts to notification service
  for (const alert of alerts) {
    await sendAlert(alert);
  }
}

/**
 * Send metrics sample to analytics backend
 * In production, send to DataDog, New Relic, or custom service
 */
async function sendToAnalytics(sample: MetricsSample) {
  try {
    // Example: Send to custom Supabase analytics table
    const response = await fetch("/api/metrics/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sample),
    });

    if (!response.ok) {
      console.error("[Metrics] Failed to store metrics:", response.statusText);
    }
  } catch (error) {
    console.error("[Metrics] Send to analytics failed:", error);
    // Graceful failure - don't break the application
  }
}

/**
 * Send alert notification (Slack, email, etc.)
 */
async function sendAlert(alert: Alert) {
  try {
    const response = await fetch("/api/alerts/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      console.error("[Alert] Failed to send notification:", response.statusText);
    }
  } catch (error) {
    console.error("[Alert] Send notification failed:", error);
  }
}

/**
 * Helper: Get process memory usage in MB
 */
function getProcessMemoryUsage(): number {
  if (typeof process === "undefined") return 0;
  const memUsage = process.memoryUsage();
  return Math.round(memUsage.heapUsed / 1024 / 1024);
}

/**
 * Helper: Get active subscription count (placeholder)
 * In real implementation, track from Realtime subscriptions
 */
function getActiveSubscriptionCount(): number {
  // TODO: Integrate with actual Realtime subscription tracking
  return 0;
}

/**
 * Helper: Get active user count (placeholder)
 * In real implementation, track from session store
 */
function getActiveUserCount(): number {
  // TODO: Integrate with actual session tracking
  return 0;
}

/**
 * Phase 4 Implementation Checklist:
 * 
 * ✅ Create MetricsCollector class
 * ✅ Setup automatic metrics flushing (5-min interval)
 * ✅ Implement alert thresholds
 * ✅ Create metrics storage endpoint (/api/metrics/store)
 * ✅ Create alert notification endpoint (/api/alerts/notify)
 * ✅ Add trend analysis
 * 
 * Next Steps:
 * 1. Initialize metrics collector on app startup
 *    → Call setupAutomaticMetricsFlushing() in next.config.js or middleware
 * 
 * 2. Track metrics in middleware or API routes
 *    → Call metricsCollector.recordCacheHit() on cache hit
 *    → Call metricsCollector.recordCacheMiss() on cache miss
 *    → Call metricsCollector.recordDbQuery() on DB access
 *    → Call metricsCollector.recordResponseTime(ms) on request complete
 * 
 * 3. Create monitoring dashboard
 *    → Query recent samples from /api/metrics/dashboard
 *    → Display trends and alerts
 *    → Real-time updates via WebSocket or polling
 * 
 * 4. Integration points (TBD):
 *    - Middleware for response time tracking
 *    - Database client wrapper for query counting
 *    - Cache module exports for hit/miss tracking
 *    - Webhook handler for external alerts
 */

export type { MetricsSample, Alert };
