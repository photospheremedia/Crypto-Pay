#!/bin/bash

# 🔍 Real-time Performance Monitoring Script
# Monitors cache performance, database queries, and system health
# Run: bash scripts/monitor-performance.sh

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MONITOR_INTERVAL=30  # seconds between checks
MAX_CHECKS=0         # 0 = infinite, otherwise stops after N checks
CHECK_COUNT=0
API_URL="${API_URL:-http://localhost:3001}"

# Historical data
declare -A PREV_HITS=()
declare -A PREV_MISSES=()
declare -A PREV_QUERIES=()

# ASCII art header
print_header() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     🔍 Crypto Pay - Performance Monitor                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Fetch metrics from dashboard endpoint
fetch_metrics() {
    curl -s "${API_URL}/api/metrics/dashboard?range=5" 2>/dev/null || echo "{}"
}

# Fetch cache monitoring data
fetch_cache_stats() {
    curl -s "${API_URL}/api/cache-monitoring" 2>/dev/null || echo "{}"
}

# Parse JSON (requires jq)
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  jq not installed. Install with: brew install jq${NC}"
        echo "Continuing with basic monitoring..."
        return 1
    fi
    return 0
}

# Display cache metrics
display_cache_metrics() {
    local cache_data="$1"
    
    if [ -z "$cache_data" ] || [ "$cache_data" = "{}" ]; then
        echo -e "${YELLOW}⚠️  Cache monitoring endpoint not responding${NC}"
        return
    fi
    
    if check_jq; then
        local cache_size=$(echo "$cache_data" | jq -r '.cacheStats.cacheSize // "N/A"')
        local subscriptions=$(echo "$cache_data" | jq -r '.cacheStats.activeSubscriptions // "N/A"')
        local hit_estimate=$(echo "$cache_data" | jq -r '.metrics.cacheHitEstimate // "N/A"')
        local memory=$(echo "$cache_data" | jq -r '.metrics.estimatedMemoryUsage // "N/A"')
        
        echo -e "${BLUE}📊 Cache Status:${NC}"
        echo -e "  Cache Size:          ${GREEN}$cache_size entries${NC}"
        echo -e "  Hit Rate Estimate:   ${GREEN}$hit_estimate${NC}"
        echo -e "  Memory Usage:        ${GREEN}$memory${NC}"
        echo -e "  Active Subscriptions: ${GREEN}$subscriptions${NC}"
    fi
}

# Display performance metrics
display_performance_metrics() {
    local metrics_data="$1"
    
    if [ -z "$metrics_data" ] || [ "$metrics_data" = "{}" ]; then
        echo -e "${YELLOW}⚠️  Metrics dashboard endpoint not responding${NC}"
        return
    fi
    
    if check_jq; then
        local hit_rate=$(echo "$metrics_data" | jq -r '.current.cacheHitRate // "N/A"')
        local response_time=$(echo "$metrics_data" | jq -r '.current.avgResponseTime // "N/A"')
        local memory=$(echo "$metrics_data" | jq -r '.current.memoryUsage // "N/A"')
        local queries=$(echo "$metrics_data" | jq -r '.current.totalDbQueries // "N/A"')
        local health=$(echo "$metrics_data" | jq -r '.health.score // "N/A"')
        
        # Color code based on thresholds
        local hit_color=$GREEN
        if (( $(echo "$hit_rate < 50" | bc -l 2>/dev/null || echo "0") )); then
            hit_color=$RED
        elif (( $(echo "$hit_rate < 70" | bc -l 2>/dev/null || echo "0") )); then
            hit_color=$YELLOW
        fi
        
        local response_color=$GREEN
        if (( $(echo "$response_time > 500" | bc -l 2>/dev/null || echo "0") )); then
            response_color=$RED
        elif (( $(echo "$response_time > 200" | bc -l 2>/dev/null || echo "0") )); then
            response_color=$YELLOW
        fi
        
        local health_color=$GREEN
        if (( $(echo "$health < 80" | bc -l 2>/dev/null || echo "0") )); then
            health_color=$RED
        elif (( $(echo "$health < 85" | bc -l 2>/dev/null || echo "0") )); then
            health_color=$YELLOW
        fi
        
        echo -e "${BLUE}⚡ Performance Metrics:${NC}"
        echo -e "  Cache Hit Rate:      ${hit_color}${hit_rate}%${NC}"
        echo -e "  Response Time:       ${response_color}${response_time}ms${NC}"
        echo -e "  Memory Usage:        ${GREEN}${memory}MB${NC}"
        echo -e "  DB Queries/Sample:   ${GREEN}${queries}${NC}"
        echo -e "  Health Score:        ${health_color}${health}/100${NC}"
        
        # Trends
        local hit_trend=$(echo "$metrics_data" | jq -r '.trends.hitRateTrend // "N/A"')
        local response_trend=$(echo "$metrics_data" | jq -r '.trends.responseTimeTrend // "N/A"')
        
        echo ""
        echo -e "${BLUE}📈 Trends:${NC}"
        echo -e "  Hit Rate:            ${hit_trend}"
        echo -e "  Response Time:       ${response_trend}"
    fi
}

# Display recommendations
display_recommendations() {
    local metrics_data="$1"
    
    if [ -z "$metrics_data" ] || [ "$metrics_data" = "{}" ]; then
        return
    fi
    
    if check_jq; then
        local recs=$(echo "$metrics_data" | jq -r '.recommendations[]?' 2>/dev/null)
        
        if [ -n "$recs" ]; then
            echo ""
            echo -e "${BLUE}💡 Recommendations:${NC}"
            while IFS= read -r rec; do
                echo -e "  $rec"
            done <<< "$recs"
        fi
    fi
}

# Display monitoring status
display_status() {
    local check_num="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Check #${check_num} | ${timestamp} | Auto-refresh in ${MONITOR_INTERVAL}s"
    
    if [ $MAX_CHECKS -gt 0 ]; then
        echo -e "Progress: ${check_num}/${MAX_CHECKS} checks"
    else
        echo -e "Running continuous monitoring (Press Ctrl+C to stop)"
    fi
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main monitoring loop
run_monitoring() {
    while true; do
        ((CHECK_COUNT++))
        
        print_header
        
        # Fetch data
        echo -e "${BLUE}🔄 Fetching metrics...${NC}"
        local cache_data=$(fetch_cache_stats)
        local metrics_data=$(fetch_metrics)
        
        echo ""
        
        # Display metrics
        display_cache_metrics "$cache_data"
        echo ""
        display_performance_metrics "$metrics_data"
        echo ""
        display_recommendations "$metrics_data"
        
        # Display status
        display_status $CHECK_COUNT
        
        # Check exit condition
        if [ $MAX_CHECKS -gt 0 ] && [ $CHECK_COUNT -ge $MAX_CHECKS ]; then
            echo ""
            echo -e "${GREEN}✅ Monitoring complete${NC}"
            break
        fi
        
        # Wait before next check
        sleep $MONITOR_INTERVAL
    done
}

# Help text
show_help() {
    echo "Performance Monitoring Script"
    echo ""
    echo "Usage: bash scripts/monitor-performance.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --interval N      Check interval in seconds (default: 30)"
    echo "  --checks N        Maximum number of checks (default: 0 = infinite)"
    echo "  --api-url URL     API base URL (default: http://localhost:3001)"
    echo "  --help            Show this help text"
    echo ""
    echo "Examples:"
    echo "  # Monitor continuously with 30s interval"
    echo "  bash scripts/monitor-performance.sh"
    echo ""
    echo "  # Monitor 10 times with 60s interval"
    echo "  bash scripts/monitor-performance.sh --checks 10 --interval 60"
    echo ""
    echo "  # Monitor against production API"
    echo "  bash scripts/monitor-performance.sh --api-url https://app.restauranthub.com"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --interval)
            MONITOR_INTERVAL="$2"
            shift 2
            ;;
        --checks)
            MAX_CHECKS="$2"
            shift 2
            ;;
        --api-url)
            API_URL="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run monitoring
echo -e "${GREEN}Starting performance monitoring...${NC}"
echo "API URL: $API_URL"
echo "Interval: ${MONITOR_INTERVAL}s"
if [ $MAX_CHECKS -gt 0 ]; then
    echo "Max checks: $MAX_CHECKS"
else
    echo "Mode: Continuous"
fi
echo ""
sleep 2

run_monitoring
