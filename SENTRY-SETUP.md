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

## Step 1: Create Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up with your email (or GitHub)
3. Verify your email address
4. Complete onboarding survey (select "Personal" or "Organization")

---

## Step 2: Create a New Project

1. On the Sentry dashboard, click **"Create Project"**
2. **Platform:** Select **"Next.js"**
3. **Alert frequency:** Select **"Alert me on every new issue"** (recommended for starting out)
4. **Project name:** `lobbyist-registration-dev` (or your preferred name)
5. **Team:** Default team is fine
6. Click **"Create Project"**

---

## Step 3: Get Your DSN (Data Source Name)

After creating the project:

1. You'll see a **DSN** on the configuration page
2. It looks like: `https://abc123def456@o123456.ingest.sentry.io/7654321`
3. **Copy this DSN** - you'll need it in the next step

**To find DSN later:**
- Go to **Settings** → **Projects** → Your Project → **Client Keys (DSN)**

---

## Step 4: Configure Environment Variables

### Local Development (.env.local)

Create or update `.env.local` in the project root:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/7654321
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/7654321
SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# Optional: For source map uploads (not needed for free tier)
# SENTRY_ORG=your-org-name
# SENTRY_PROJECT=lobbyist-registration-dev
# SENTRY_AUTH_TOKEN=your-auth-token
```

**Replace `https://your-dsn-here@...` with your actual DSN from Step 3.**

### Production Environment (.env.production or Cloud Run)

For Cloud Run deployment, add these as secrets:

```bash
SENTRY_DSN=https://your-dsn-here@...
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@...
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

**Google Cloud Run setup:**

```bash
# Create Sentry DSN secret
gcloud secrets create sentry-dsn --data-file=- <<< "https://your-dsn-here@..."

# Add to Cloud Run service
gcloud run services update lobbyist-registration-dev \
  --update-env-vars SENTRY_ENVIRONMENT=production \
  --update-secrets SENTRY_DSN=sentry-dsn:latest \
  --update-secrets NEXT_PUBLIC_SENTRY_DSN=sentry-dsn:latest \
  --region us-west1
```

---

## Step 5: Verify Installation

### Test Error Tracking

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Create a test error page** (temporary):

   Create `app/sentry-test/page.tsx`:
   ```tsx
   "use client";

   export default function SentryTestPage() {
     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-4">Sentry Test Page</h1>

         <button
           onClick={() => {
             throw new Error("Test Error: Sentry is working!");
           }}
           className="px-4 py-2 bg-red-600 text-white rounded"
         >
           Trigger Client Error
         </button>

         <button
           onClick={async () => {
             await fetch("/api/sentry-test-error");
           }}
           className="ml-4 px-4 py-2 bg-blue-600 text-white rounded"
         >
           Trigger Server Error
         </button>
       </div>
     );
   }
   ```

3. **Create API test route** (temporary):

   Create `app/api/sentry-test-error/route.ts`:
   ```ts
   import { NextResponse } from "next/server";

   export async function GET() {
     throw new Error("Test API Error: Server-side Sentry is working!");
     return NextResponse.json({ message: "This won't execute" });
   }
   ```

4. **Visit the test page:**
   - Go to http://localhost:3000/sentry-test
   - Click "Trigger Client Error" button
   - Check Sentry dashboard for the error

5. **Check Sentry Dashboard:**
   - Go to https://sentry.io
   - Select your project
   - Look for the test errors in the Issues list
   - You should see "Test Error: Sentry is working!"

6. **Clean up:**
   - Delete `app/sentry-test/page.tsx`
   - Delete `app/api/sentry-test-error/route.ts`

---

## Step 6: Understanding Sentry Configuration

### Client-Side Tracking (`sentry.client.config.ts`)

**What it tracks:**
- JavaScript errors in the browser
- Unhandled promise rejections
- React component errors
- Network request failures

**PII Protection:**
- Removes email, phone, SSN from breadcrumbs
- Masks all text in session replays
- Blocks all media in replays
- Development errors are filtered out

### Server-Side Tracking (`sentry.server.config.ts`)

**What it tracks:**
- API route errors
- Server-side rendering errors
- Database errors
- Authentication failures

**PII Protection:**
- Removes authorization headers
- Removes cookies
- Filters sensitive query params (token, password, api_key)
- Removes sensitive context data

### Edge Runtime (`sentry.edge.config.ts`)

**What it tracks:**
- Middleware errors
- Edge function errors

---

## Step 7: Using Sentry in Code

### Capture Custom Errors

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Your code
  await dangerousOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: "lobbyist-registration",
    },
    extra: {
      userId: user.id,
      action: "submit-report",
    },
  });
  throw error; // Re-throw or handle
}
```

### Add Custom Context

```typescript
import * as Sentry from "@sentry/nextjs";

// Set user context (careful with PII!)
Sentry.setUser({
  id: user.id,
  // Don't include email or other PII in production
});

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: "form",
  message: "Expense report submitted",
  level: "info",
});
```

### Capture Messages

```typescript
import * as Sentry from "@sentry/nextjs";

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
3. Example alert:
   - **When:** Any issue is seen for the first time
   - **Then:** Send email notification
   - **Conditions:** All issues

### Useful Metrics to Watch

- **Error Rate** - Spikes indicate problems
- **Affected Users** - How many users hit errors
- **Error Frequency** - How often errors occur
- **Environment** - Errors by dev/staging/production

---

## Best Practices

### ✅ DO

- Set user context (user ID only, no PII)
- Add relevant tags for filtering
- Use breadcrumbs for debugging context
- Set environment correctly (development/production)
- Review errors weekly
- Fix errors promptly

### ❌ DON'T

- Send PII (email, phone, SSN) to Sentry
- Ignore errors in Sentry dashboard
- Leave test errors in production
- Exceed free tier limits unnecessarily
- Use Sentry in place of logging

### Government Compliance

**PII Protection:**
- Our config filters PII automatically
- Review error details before sharing
- Don't include sensitive data in custom tags/context

**Data Retention:**
- Free tier: 30 days
- Compliant with most data retention policies
- Can be self-hosted if needed

---

## Troubleshooting

### Errors Not Appearing in Sentry

**Check:**
1. DSN is set correctly in environment variables
2. `NEXT_PUBLIC_SENTRY_DSN` for client-side
3. `SENTRY_DSN` for server-side
4. Not in development mode (filters out dev errors)
5. Sentry dashboard project is correct

**Debug Mode:**
Edit `sentry.*.config.ts` and set `debug: true`

### Too Many Errors

**If approaching 5k/month limit:**
1. **Filter noise** - Ignore known issues
2. **Sample errors** - Reduce `tracesSampleRate`
3. **Upgrade plan** - $29/month for Team plan
4. **Self-host** - If budget allows

### Performance Issues

Sentry adds minimal overhead:
- < 50KB to client bundle
- < 1ms per request
- Async uploads don't block

---

## Next Steps

Once Sentry is working:

1. ✅ Monitor errors in development
2. ✅ Test in production deployment
3. ✅ Set up alert notifications
4. ✅ Review errors weekly
5. ⏳ Configure integrations (Slack, GitHub)
6. ⏳ Set up release tracking
7. ⏳ Enable performance monitoring

---

## Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Dashboard:** https://sentry.io
- **Support:** https://sentry.io/support/

---

## Cost Tracking

**Free Tier Usage:**
- Login to Sentry dashboard
- Go to **Settings** → **Subscription**
- View current month's event count
- Set up usage alerts at 80% (4,000 events)

**If Approaching Limit:**
- Upgrade to Team plan ($29/month, 50k events)
- OR filter out noisy errors
- OR consider self-hosting

---

## Security Notes

**What Sentry Receives:**
- Error stack traces
- Request URLs (no query params with sensitive data)
- Browser/OS information
- Performance metrics

**What Sentry DOESN'T Receive:**
- Passwords
- API keys
- Session tokens
- Cookies
- Email addresses (filtered)
- Phone numbers (filtered)
- SSNs (filtered)

**Data Location:**
- Sentry servers (US-based)
- GDPR compliant
- SOC 2 Type II certified

If county IT requires data residency, consider self-hosting.
