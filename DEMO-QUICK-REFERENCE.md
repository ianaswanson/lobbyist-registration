# Demo Quick Reference - Rule of 3 Pattern

**Last Updated:** October 22, 2025
**Environment:** Dev (Cloud Run + Cloud SQL)

---

## 🔗 Quick Links

| Resource | URL/Command |
|----------|-------------|
| **Dev Application** | https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app |
| **Cloud Console** | https://console.cloud.google.com/run?project=lobbyist-475218 |
| **Database** | Cloud SQL: `lobbyist-475218:us-west1:lobbyist-registration-db` |
| **Connect to DB** | `cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5433` |

---

## 👥 Test Accounts

### Lobbyists (Use These for Demos!)
```
Email: lobbyist1@example.com   Password: lobbyist123
Email: lobbyist2@example.com   Password: lobbyist123
Email: lobbyist3@example.com   Password: lobbyist123
```
**What to expect:** Each has 3 expense reports (Q1, Q2, Q3 2025) with 3 line items each

### Employers
```
Email: employer1@example.com   Password: employer123
Email: employer2@example.com   Password: employer123
```

### Board Members
```
Email: boardmember1@example.com   Password: board123
Email: boardmember2@example.com   Password: board123
```

### Admin
```
Email: admin@multco.us   Password: admin123
```

---

## 📊 Rule of 3 Pattern

| Item | Count | Formula |
|------|-------|---------|
| Approved Lobbyists | 3 | Base unit |
| Expense Reports | 9 | 3 lobbyists × 3 quarters |
| Line Items | 27 | 9 reports × 3 items |

**Quarters:** Q1 2025, Q2 2025, Q3 2025
**Status:** All APPROVED

---

## 🔄 Re-seed Database

### Option 1: Via Cloud Run (Recommended)
```bash
# Force re-seed
gcloud run services update lobbyist-registration-dev \
  --project=lobbyist-475218 \
  --region=us-west1 \
  --update-env-vars=FORCE_RESEED=true

# Wait 60 seconds for seed to complete

# Remove flag
gcloud run services update lobbyist-registration-dev \
  --project=lobbyist-475218 \
  --region=us-west1 \
  --remove-env-vars=FORCE_RESEED
```

### Option 2: Via Local Script
```bash
# Set environment variables
export DATABASE_URL="postgresql://lobbyist_user:PASSWORD@localhost:5433/lobbyist_dev"

# Run seed
npm run prisma:db:seed
```

---

## 🧪 Quick Verification

### Check Database Counts
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
PGPASSWORD='PASSWORD' psql -h localhost -p 5433 -U lobbyist_user -d lobbyist_dev -c "
SELECT
  'Lobbyists (approved)' as metric,
  COUNT(*) as count
FROM \"Lobbyist\"
WHERE status = 'APPROVED'
UNION ALL
SELECT 'Reports', COUNT(*) FROM \"LobbyistExpenseReport\"
UNION ALL
SELECT 'Line Items', COUNT(*) FROM \"ExpenseLineItem\" WHERE \"reportType\" = 'LOBBYIST';
"
```

**Expected Output:**
```
Lobbyists (approved) |     3
Reports              |     9
Line Items           |    27
```

---

## 🎯 Demo Flow

### 1. Homepage
- Navigate to: https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
- Show public transparency features

### 2. Lobbyist Login
- Click "Sign In"
- Use: `lobbyist1@example.com` / `lobbyist123`
- Navigate to "My Expense Reports"

### 3. Show Rule of 3
- **Point out:** 3 reports visible (Q1, Q2, Q3 2025)
- **Click:** Q1 2025 report
- **Show:** 3 line items with details
- **Explain:** Every lobbyist has same pattern for consistency

### 4. Other Roles
- Log out and sign in as employer or board member
- Show their respective dashboards with Rule of 3 data

---

## 🔍 Troubleshooting

### Database Empty After Deployment?
```bash
# Check if FORCE_RESEED is set
gcloud run services describe lobbyist-registration-dev \
  --project=lobbyist-475218 \
  --region=us-west1 \
  --format="value(spec.template.spec.containers[0].env)"

# If not set, trigger re-seed (see Re-seed section above)
```

### Can't Connect to Database?
```bash
# Start Cloud SQL Proxy
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5433

# Test connection
PGPASSWORD='PASSWORD' psql -h localhost -p 5433 -U lobbyist_user -d lobbyist_dev -c "SELECT 1;"
```

### Homepage Shows Error?
```bash
# Check service status
gcloud run services describe lobbyist-registration-dev \
  --project=lobbyist-475218 \
  --region=us-west1 \
  --format="value(status.conditions)"

# Check recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" \
  --project=lobbyist-475218 \
  --limit=50 \
  --format="value(textPayload)"
```

---

## 📝 Notes for Stakeholders

### Why "Rule of 3"?
- **Consistent:** Every demo shows same data structure
- **Memorable:** Easy to explain (3 lobbyists, 3 reports, 3 items)
- **Realistic:** Covers a full quarter cycle (Q1, Q2, Q3)
- **Testable:** Simple to verify everything is working

### What's Different from Production?
- **Data Volume:** Production will have hundreds of lobbyists, not 3
- **Quarters:** Production will have historical data (multiple years)
- **Status Variety:** Production will have draft, pending, approved, rejected
- **Real Names:** Production will use actual lobbyist and employer names

### How to Request Changes?
- **Email:** ian@example.com (replace with actual contact)
- **Beads:** Create issue with `bd create "Feature request description"`
- **Demo Feedback:** Note specific screens or workflows that need improvement

---

## 🚀 Deployment Info

| Item | Value |
|------|-------|
| **Latest Commit** | `2d9b16b` - Rule of 3 pattern implementation |
| **Branch** | `develop` |
| **Cloud Run Revision** | `lobbyist-registration-dev-00044-b24` |
| **Deployment Date** | October 22, 2025 |
| **Build Status** | SUCCESS |
| **Seed Status** | ✅ Verified |

---

## 📚 Related Documentation

- `RULE-OF-3-DEPLOYMENT-SUCCESS.md` - Complete deployment details
- `DEPLOYMENT-PLAN.md` - Full deployment procedures
- `DEMO-GUIDE.html` - Interactive demo walkthrough
- `PROJECT.md` - Project requirements and roadmap
- `CLAUDE.md` - Development guidelines

---

**Quick Copy-Paste for Demos:**

```
URL:      https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
Lobbyist: lobbyist1@example.com / lobbyist123
Employer: employer1@example.com / employer123
Admin:    admin@multco.us / admin123
```
