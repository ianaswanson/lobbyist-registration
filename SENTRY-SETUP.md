# Sentry Error Tracking Setup Guide

This guide walks you through setting up Sentry error tracking for the Lobbyist Registration application.

## Overview

**What is Sentry?**
- Real-time error tracking and monitoring
- Captures exceptions, logs, and performance issues
- Provides detailed stack traces and context
- Helps debug production issues quickly

**Plan:** Sentry SaaS Free Tier
- Cost: $0/month
- Limit: 5,000 errors/month
- Retention: 30 days
- 1 user

---

## Quick Start (Recommended): Use Sentry Wizard

The official Sentry setup uses an **automated wizard** that handles everything for you.

### Step 1: Run the Sentry Wizard

```bash
npx @sentry/wizard@latest -i nextjs
```

**What the wizard does:**
1. **Login or Create Account** - Guides you through Sentry account creation
2. **Create Project** - Sets up a new Sentry project for your app
3. **Configure Files** - Automatically updates your config files with DSN
4. **Create Auth Token** - Sets up `.sentryclirc` for source map uploads
5. **Add Test Page** - Creates `/sentry-example-page` for testing
6. **Enable Features** - Prompts you to enable tracing, session replay, logs

### Step 2: Follow the Interactive Prompts

The wizard will ask you:
- **Login to Sentry** (or create account if you don't have one)
- **Organization name** (can use default)
- **Project name** - Suggest: `lobbyist-registration-dev`
- **Enable tracing?** - Recommend: Yes (performance monitoring)
- **Enable session replay?** - Recommend: Yes (user session playback)
- **Enable logs?** - Optional: Up to you
- **Source maps?** - Recommend: Yes (better stack traces)

### Step 3: Verify Installation

Visit the test page:
```
http://localhost:3000/sentry-example-page
```

Click **"Throw error!"** button to test error tracking.

Check your Sentry dashboard:
- Go to https://sentry.io
- Select your project
- Look for the test error in **Issues** tab

### Step 4: Clean Up (Optional)

Delete the test page after verification:
```bash
rm -rf app/sentry-example-page
```

---

## Important Notes

### Our Project Already Has Sentry Installed

**Note:** We've already run `npm install @sentry/nextjs` and created manual configuration files.

**What this means:**
- The wizard will **detect existing config** and ask if you want to overwrite
- **Recommendation:** Let the wizard overwrite our manual config
- The wizard's config is more up-to-date and follows best practices

**Why our manual config exists:**
- Created before we knew about the wizard
- Includes custom PII filtering for government compliance
- You may want to **merge** wizard config with our PII filters

### Merging Wizard Config with Our PII Filters

After running the wizard, you may want to add back our PII protection:

**In `sentry.client.config.ts`, add to beforeSend:**
```typescript
beforeSend(event, hint) {
  // Filter development errors
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  // Remove PII from breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.data) {
        const sanitized = { ...breadcrumb.data };
        delete sanitized.email;
        delete sanitized.phone;
        delete sanitized.ssn;
        return { ...breadcrumb, data: sanitized };
      }
      return breadcrumb;
    });
  }

  return event;
}
```

**In `sentry.server.config.ts`, add to beforeSend:**
```typescript
beforeSend(event, hint) {
  // Filter development errors
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers.authorization;
    delete event.request.headers.cookie;
  }

  // Filter sensitive query params
  if (event.request?.query_string) {
    event.request.query_string = event.request.query_string
      .split("&")
      .filter(
        (param) =>
          !param.startsWith("token=") &&
          !param.startsWith("password=") &&
          !param.startsWith("api_key=")
      )
      .join("&");
  }

  return event;
}
```

---

## Alternative: Manual Setup (Not Recommended)

If you prefer not to use the wizard, follow these manual steps:

### Step 1: Create Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up with your email (or GitHub)
3. Verify your email address
4. Complete onboarding survey

### Step 2: Create Project

1. Click **"Create Project"**
2. Platform: **Next.js**
3. Project name: `lobbyist-registration-dev`
4. Click **"Create Project"**

### Step 3: Get DSN

Copy your DSN from the project setup page:
```
https://abc123@o123456.ingest.sentry.io/7654321
```

### Step 4: Configure Environment Variables

Create or update `.env.local`:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/7654321
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/7654321
SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

### Step 5: Update Config Files

Our existing config files are already set up. Just update with your DSN in `.env.local`.

### Step 6: Test Manually

Create a test page at `app/test-sentry/page.tsx`:

```tsx
"use client";

export default function TestSentryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Sentry</h1>
      <button
        onClick={() => {
          throw new Error("Test Error: Sentry is working!");
        }}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Trigger Error
      </button>
    </div>
  );
}
```

Visit http://localhost:3000/test-sentry and click the button.

---

## Production Deployment (Cloud Run)

### Step 1: Create Secret

```bash
# Get your DSN from Sentry dashboard
export SENTRY_DSN="https://your-dsn@o123456.ingest.sentry.io/7654321"

# Create secret
gcloud secrets create sentry-dsn \
  --data-file=- <<< "$SENTRY_DSN"

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding sentry-dsn \
  --member="serviceAccount:679888289147-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 2: Update Cloud Run Service

```bash
gcloud run services update lobbyist-registration-dev \
  --update-env-vars SENTRY_ENVIRONMENT=production,NEXT_PUBLIC_SENTRY_ENVIRONMENT=production \
  --update-secrets SENTRY_DSN=sentry-dsn:latest,NEXT_PUBLIC_SENTRY_DSN=sentry-dsn:latest \
  --region us-west1
```

### Step 3: Verify in Production

1. Deploy your application
2. Trigger an error in production
3. Check Sentry dashboard for production errors

---

## Understanding Sentry Configuration

### Files Created (by wizard or manually)

**sentry.client.config.ts** - Client-side tracking
- Browser JavaScript errors
- React component errors
- Network failures
- Session replay

**sentry.server.config.ts** - Server-side tracking
- API route errors
- SSR errors
- Database errors
- Auth failures

**sentry.edge.config.ts** - Edge runtime tracking
- Middleware errors
- Edge function errors

**instrumentation.ts** - Initialization hook
- Loads correct config based on runtime
- Required by Next.js for Sentry

**next.config.ts** - Build configuration
- Wrapped with `withSentryConfig`
- Source map upload settings
- Build-time integration

**.sentryclirc** - CLI authentication (wizard only)
- Auth token for source map uploads
- Should be in `.gitignore` (wizard adds this)

---

## PII Protection (Government Requirement)

**Our manual config includes PII filtering:**

✅ Email addresses removed
✅ Phone numbers removed
✅ SSNs removed
✅ Authorization headers removed
✅ Cookies removed
✅ Sensitive query params filtered

**If using wizard config, add these filters manually** (see "Merging Wizard Config" section above).

**Why this matters:**
- Government applications handle sensitive citizen data
- GDPR/privacy compliance
- County IT security requirements
- Public records law implications

---

## Using Sentry in Your Code

### Capture Custom Errors

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  await submitExpenseReport(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: "expense-reporting",
    },
    extra: {
      userId: user.id,
      reportId: report.id,
    },
  });
  throw error;
}
```

### Add Context

```typescript
Sentry.setUser({
  id: user.id,
  // Don't include email or PII
});

Sentry.addBreadcrumb({
  category: "form",
  message: "Expense report submitted",
  level: "info",
});
```

### Capture Messages

```typescript
Sentry.captureMessage("Unusual activity detected", {
  level: "warning",
  tags: {
    feature: "compliance-monitoring",
  },
});
```

---

## Monitoring & Alerts

### Configure Alerts

1. Go to **Alerts** in Sentry dashboard
2. **Create Alert Rule**
3. Example:
   - When: Issue seen for first time
   - Then: Send email
   - Conditions: All issues

### What to Monitor

- **Error Rate** - Spikes indicate problems
- **Affected Users** - How many users impacted
- **Error Frequency** - How often errors occur
- **Environment** - Dev vs production errors

---

## Best Practices

### ✅ DO

- Use the Sentry wizard for setup
- Set user context (user ID only, no PII)
- Add relevant tags for filtering
- Set environment correctly (dev/production)
- Review errors weekly
- Fix errors promptly

### ❌ DON'T

- Send PII (email, phone, SSN) to Sentry
- Ignore errors in dashboard
- Leave test errors in production
- Exceed free tier limits unnecessarily
- Hardcode DSN in code (use env vars)

---

## Troubleshooting

### Wizard Issues

**"Command not found"**
```bash
# Make sure npx is available
npm install -g npm
```

**"Login failed"**
- Check your Sentry credentials
- Try creating account first at sentry.io

**"Config already exists"**
- Wizard will ask to overwrite
- Safe to overwrite our manual config
- May want to backup PII filters first

### Errors Not Appearing

**Check:**
1. DSN is set correctly in env vars
2. `NEXT_PUBLIC_SENTRY_DSN` for client-side
3. `SENTRY_DSN` for server-side
4. Not in development mode (we filter dev errors)
5. Restart dev server after changing .env.local

**Enable debug mode:**
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: true,  // Add this
  // ... rest of config
});
```

### Too Many Errors

**Approaching 5k/month limit:**
1. Filter noise - ignore known issues
2. Sample errors - reduce `tracesSampleRate`
3. Upgrade to Team plan ($29/month)
4. Self-host on GCP (~$50-85/month)

---

## Cost Tracking

### Free Tier Limits

- **5,000 errors/month**
- **1 user**
- **30-day retention**
- **Unlimited projects**

### Monitor Usage

1. Login to Sentry dashboard
2. Go to **Settings** → **Subscription**
3. View current month's event count
4. Set usage alert at 80% (4,000 events)

### If Approaching Limit

**Option 1:** Upgrade to Team ($29/month, 50k events)
**Option 2:** Filter noisy errors
**Option 3:** Self-host on GCP (~$50-85/month)

---

## Security & Compliance

### What Sentry Receives

✅ Error stack traces
✅ Request URLs (no sensitive params)
✅ Browser/OS information
✅ Performance metrics

### What Sentry DOESN'T Receive

❌ Passwords (filtered)
❌ API keys (filtered)
❌ Session tokens (filtered)
❌ Cookies (filtered)
❌ Email addresses (filtered with our config)
❌ Phone numbers (filtered with our config)
❌ SSNs (filtered with our config)

### Data Location

- **Sentry servers** (US-based)
- **GDPR compliant**
- **SOC 2 Type II certified**
- **30-day retention** (free tier)

**If county requires data residency:**
- Can self-host Sentry on GCP
- Keeps all data in us-west1 region
- Costs ~$50-85/month

---

## Next Steps

### After Wizard Setup

1. ✅ Test error tracking with `/sentry-example-page`
2. ✅ Delete test page
3. ✅ Add PII filters to config (see "Merging" section)
4. ✅ Configure alerts
5. ✅ Deploy to Cloud Run with secrets
6. ✅ Test production error tracking
7. ⏳ Set up Slack integration (optional)
8. ⏳ Configure release tracking
9. ⏳ Enable performance monitoring

---

## Resources

- **Sentry Wizard Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Manual Setup:** https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- **Configuration:** https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/
- **Dashboard:** https://sentry.io
- **Support:** https://sentry.io/support/

---

## Summary

**Recommended approach:**
1. Run `npx @sentry/wizard@latest -i nextjs`
2. Follow interactive prompts
3. Add PII filters to generated config
4. Test with `/sentry-example-page`
5. Deploy to Cloud Run
6. Monitor errors in dashboard

**Total time:** ~10 minutes with wizard (vs ~30 minutes manual)

The wizard handles account creation, project setup, DSN configuration, and file generation automatically - much easier than manual setup!
