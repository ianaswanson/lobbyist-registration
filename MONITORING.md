# Monitoring & Alerting Guide

This document describes the monitoring infrastructure for the Multnomah County Lobbyist Registration System.

## Current Monitoring Status

### ✅ Active Monitoring

**Sentry Error Tracking** (Production)
- **Status:** Configured and running
- **Organization:** claudian
- **Project:** lobbyist-registration
- **Dashboard:** https://sentry.io/organizations/claudian/projects/lobbyist-registration/
- **Coverage:** Client-side, server-side, and edge runtime errors
- **PII Protection:** Enabled (email, phone, SSN filtered)
- **Session Replay:** Enabled with full text/media masking
- **Free Tier:** 5,000 errors/month

**Cloud Run Built-in Metrics** (Production & Dev)
- **Access:** Google Cloud Console → Cloud Run → [Service] → Metrics
- **Available Metrics:**
  - Request count and latency
  - Container CPU and memory usage
  - Container instance count
  - Request/response sizes
  - Error rates (4xx, 5xx responses)
- **Retention:** 6 weeks

**Cloud SQL Monitoring** (Production)
- **Access:** Google Cloud Console → SQL → [Instance] → Monitoring
- **Available Metrics:**
  - CPU and memory utilization
  - Storage usage
  - Connections (active and total)
  - Replication lag (if applicable)
  - Queries per second

**Cloud Build Logs** (CI/CD)
- **Access:** Google Cloud Console → Cloud Build → History
- **Retention:** 120 days
- **Notifications:** Console only (no alerts configured)

### ⏳ Recommended Monitoring (Not Yet Configured)

The following monitoring is recommended but requires manual setup:

1. **Uptime Monitoring** - Alert when service is down
2. **Error Rate Alerts** - Alert on sustained high error rates
3. **Response Time Alerts** - Alert on slow response times
4. **Database Alerts** - Alert on high CPU/memory/storage
5. **Budget Alerts** - Alert on unexpected cost increases

---

## How to Set Up Monitoring Alerts

### Prerequisites

- Google Cloud project access (`lobbyist-475218`)
- Email address for notifications
- (Optional) SMS/phone number for critical alerts
- (Optional) Slack/PagerDuty integration

### Step 1: Create Notification Channel

1. Go to **Cloud Console → Monitoring → Alerting → Notification Channels**
2. Click **Create Notification Channel**
3. Choose channel type:
   - **Email** (recommended for all alerts)
   - **SMS** (recommended for critical production alerts)
   - **Slack** (good for team notifications)
   - **PagerDuty** (for 24/7 on-call)
4. Configure and save

Example CLI command:
```bash
gcloud alpha monitoring channels create \
  --display-name="Primary On-Call Email" \
  --type=email \
  --channel-labels=email_address=your-email@example.com
```

### Step 2: Create Alert Policies

#### Alert 1: Service Downtime (Critical)

**Purpose:** Alert immediately if the Cloud Run service stops responding

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="[CRITICAL] Lobbyist Registration Service Down" \
  --condition-display-name="Service is not serving requests" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s \
  --condition-filter='
    resource.type="cloud_run_revision" AND
    resource.labels.service_name="lobbyist-registration" AND
    metric.type="run.googleapis.com/request_count"
  ' \
  --condition-aggregation-per-series-aligner=ALIGN_RATE \
  --condition-aggregation-cross-series-reducer=REDUCE_SUM \
  --condition-comparison=COMPARISON_LT
```

**Rationale:** If request count drops to zero for 5 minutes, service is likely down.

#### Alert 2: High Error Rate (Warning)

**Purpose:** Alert when 5xx errors exceed 5% of total requests

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="[WARNING] High Error Rate (>5%)" \
  --condition-display-name="Error rate above threshold" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s \
  --condition-filter='
    resource.type="cloud_run_revision" AND
    resource.labels.service_name="lobbyist-registration" AND
    metric.type="run.googleapis.com/request_count" AND
    metric.labels.response_code_class="5xx"
  '
```

#### Alert 3: Slow Response Times (Warning)

**Purpose:** Alert when average response time exceeds 3 seconds

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="[WARNING] Slow Response Times (>3s)" \
  --condition-display-name="Request latency above 3s" \
  --condition-threshold-value=3000 \
  --condition-threshold-duration=600s \
  --condition-filter='
    resource.type="cloud_run_revision" AND
    resource.labels.service_name="lobbyist-registration" AND
    metric.type="run.googleapis.com/request_latencies"
  ' \
  --condition-aggregation-per-series-aligner=ALIGN_DELTA \
  --condition-aggregation-aligner-reducer=REDUCE_MEAN
```

#### Alert 4: Database High CPU (Warning)

**Purpose:** Alert when Cloud SQL CPU utilization exceeds 80%

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="[WARNING] Database CPU High (>80%)" \
  --condition-display-name="Cloud SQL CPU usage high" \
  --condition-threshold-value=0.8 \
  --condition-threshold-duration=600s \
  --condition-filter='
    resource.type="cloudsql_database" AND
    resource.labels.database_id="lobbyist-475218:lobbyist-registration-db" AND
    metric.type="cloudsql.googleapis.com/database/cpu/utilization"
  '
```

#### Alert 5: Database Storage Low (Critical)

**Purpose:** Alert when Cloud SQL storage exceeds 90% capacity

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="[CRITICAL] Database Storage Low (<10% free)" \
  --condition-display-name="Cloud SQL storage nearly full" \
  --condition-threshold-value=0.9 \
  --condition-threshold-duration=300s \
  --condition-filter='
    resource.type="cloudsql_database" AND
    resource.labels.database_id="lobbyist-475218:lobbyist-registration-db" AND
    metric.type="cloudsql.googleapis.com/database/disk/utilization"
  '
```

### Step 3: Set Up Budget Alerts

1. Go to **Cloud Console → Billing → Budgets & alerts**
2. Click **Create Budget**
3. Configure:
   - **Name:** "Lobbyist Registration Monthly Budget"
   - **Projects:** lobbyist-475218
   - **Budget amount:** $100/month (adjust as needed)
   - **Alert thresholds:** 50%, 90%, 100%
   - **Notification channel:** Your email
4. Save

Expected monthly costs:
- Cloud Run (1 min instance): ~$5/month
- Cloud SQL (db-f1-micro): ~$7/month
- Cloud Build: ~$2/month (within free tier)
- **Total:** ~$14/month baseline, ~$84/month with all services

---

## Viewing Metrics (No Setup Required)

### Cloud Run Metrics

**Access:** https://console.cloud.google.com/run/detail/us-west1/lobbyist-registration/metrics

**Key Metrics:**
- **Request count:** Total requests over time
- **Request latency:** 50th, 95th, 99th percentile response times
- **Container instances:** Active instances (should be 1 for dev, 1+ for prod)
- **CPU utilization:** Container CPU usage
- **Memory utilization:** Container memory usage
- **Billable container time:** How long containers ran

**What to Look For:**
- ✅ Steady request count indicates healthy traffic
- ✅ Low latency (<500ms p95) indicates good performance
- ⚠️ Spike in latency may indicate slow database queries or high load
- ❌ Zero request count for extended period indicates downtime

### Sentry Error Dashboard

**Access:** https://sentry.io/organizations/claudian/projects/lobbyist-registration/

**Key Metrics:**
- **Error rate:** Errors per minute/hour
- **Affected users:** How many unique users hit errors
- **New issues:** Recently discovered error types
- **Resolved issues:** Fixed errors

**What to Look For:**
- ✅ Low error rate (<0.1% of requests)
- ⚠️ New error types appearing (investigate immediately)
- ⚠️ High affected user count (widespread issue)
- ✅ Decreasing unresolved issue count over time

### Cloud SQL Metrics

**Access:** https://console.cloud.google.com/sql/instances/lobbyist-registration-db/monitoring

**Key Metrics:**
- **CPU utilization:** Should be <50% normally
- **Memory utilization:** Should be <80% normally
- **Storage:** Should have >20% free
- **Active connections:** Should be <10 typically
- **Queries per second:** Indicates database load

**What to Look For:**
- ✅ Consistent low CPU/memory usage
- ⚠️ Sustained high CPU (>80%) indicates slow queries or high traffic
- ⚠️ Storage >90% full requires immediate action
- ❌ Connection spikes may indicate connection leaks

---

## Monitoring Checklist

### Daily (Automated via Sentry)
- [ ] Check Sentry dashboard for new errors
- [ ] Review any alert emails received

### Weekly (Manual)
- [ ] Review Cloud Run metrics for anomalies
- [ ] Check Cloud SQL storage/performance
- [ ] Review recent deployments (Cloud Build history)
- [ ] Verify Sentry error rates are acceptable

### Monthly (Manual)
- [ ] Review billing costs vs budget
- [ ] Check for dependency updates (Dependabot PRs)
- [ ] Review security advisories
- [ ] Update this monitoring document if infrastructure changes

---

## Troubleshooting Common Issues

### High Error Rate in Sentry

1. Check Sentry dashboard for error details
2. Look for common patterns (specific pages, user actions)
3. Check Cloud Run logs for more context
4. Review recent deployments (rollback if needed)
5. Fix root cause and deploy patch

### Service Not Responding

1. Check Cloud Run metrics (is service running?)
2. Check Cloud SQL (is database responding?)
3. Review Cloud Run logs for startup errors
4. Check secrets are configured correctly
5. Verify Cloud SQL connector is attached

### Slow Response Times

1. Check Cloud Run latency metrics (which percentile is slow?)
2. Check Cloud SQL CPU/query performance
3. Review Sentry performance monitoring
4. Look for N+1 query problems
5. Consider database indexing improvements

### Database Storage Full

1. Check current storage usage in Cloud SQL
2. Identify largest tables: `SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name::regclass)) FROM information_schema.tables WHERE table_schema = 'public' ORDER BY pg_total_relation_size(table_name::regclass) DESC;`
3. Archive old data if appropriate
4. Increase Cloud SQL storage capacity
5. Set up automated storage increase

---

## Additional Resources

- [Cloud Run Monitoring Documentation](https://cloud.google.com/run/docs/monitoring)
- [Cloud SQL Monitoring Best Practices](https://cloud.google.com/sql/docs/postgres/admin-api/monitoring)
- [Sentry Best Practices](https://docs.sentry.io/product/sentry-basics/best-practices/)
- [Google Cloud Alerting Documentation](https://cloud.google.com/monitoring/alerts)

---

**Last Updated:** October 23, 2025
**Maintained by:** Ian Swanson
