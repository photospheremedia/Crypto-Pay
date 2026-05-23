"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

interface MetricsData {
  current: {
    cacheHitRate: number;
    avgResponseTime: number;
    memoryUsage: number;
    totalDbQueries: number;
  };
  trends: {
    hitRateTrend: string;
    responseTimeTrend: string;
    queryCountTrend: string;
  };
  health: {
    score: number;
    status: string;
  };
  recommendations: string[];
}

export function PerformanceMonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch metrics every 30 seconds
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics/dashboard?range=5");
        if (!response.ok) throw new Error("Failed to fetch metrics");

        const data = await response.json();
        setMetrics(data);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-4">Loading monitoring data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!metrics) return null;

  // Color indicators
  const getHitRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return "text-green-600";
    if (time < 200) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes("↑")) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend.includes("↓")) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Monitoring</h2>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate?.toLocaleTimeString()}
        </div>
      </div>

      {/* Health Score Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Health Score</p>
            <p className={`text-4xl font-bold ${getHealthColor(metrics.health.score)}`}>
              {metrics.health.score}/100
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm font-medium">Status</p>
            <p className="text-lg font-semibold text-green-600 capitalize">
              {metrics.health.status}
            </p>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cache Hit Rate */}
        <Card className="p-4">
          <p className="text-gray-600 text-sm font-medium">Cache Hit Rate</p>
          <p className={`text-3xl font-bold mt-2 ${getHitRateColor(metrics.current.cacheHitRate)}`}>
            {metrics.current.cacheHitRate.toFixed(1)}%
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            {getTrendIcon(metrics.trends.hitRateTrend)}
            <span>{metrics.trends.hitRateTrend}</span>
          </div>
        </Card>

        {/* Response Time */}
        <Card className="p-4">
          <p className="text-gray-600 text-sm font-medium">Response Time</p>
          <p className={`text-3xl font-bold mt-2 ${getResponseTimeColor(metrics.current.avgResponseTime)}`}>
            {metrics.current.avgResponseTime.toFixed(0)}ms
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            {getTrendIcon(metrics.trends.responseTimeTrend)}
            <span>{metrics.trends.responseTimeTrend}</span>
          </div>
        </Card>

        {/* Memory Usage */}
        <Card className="p-4">
          <p className="text-gray-600 text-sm font-medium">Memory Usage</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {metrics.current.memoryUsage}MB
          </p>
          <p className="text-xs text-gray-500 mt-2">Target: &lt;512MB</p>
        </Card>

        {/* DB Queries */}
        <Card className="p-4">
          <p className="text-gray-600 text-sm font-medium">Queries/Sample</p>
          <p className="text-3xl font-bold mt-2 text-purple-600">
            {metrics.current.totalDbQueries}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            {getTrendIcon(metrics.trends.queryCountTrend)}
            <span>{metrics.trends.queryCountTrend}</span>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {metrics.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Recommendations</h3>
          <div className="space-y-2">
            {metrics.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                {rec.includes("✅") ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : rec.includes("⚠️") ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-xs text-gray-500 text-center pt-4">
        Auto-refreshing every 30 seconds...
      </div>
    </div>
  );
}
