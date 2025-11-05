# Demo Data Review Checklist

## Local Review Guide
**Dev Server:** http://localhost:3001

---

## ✅ Issue 1: Quarterly Expense Chart Variation

### Page to Review
**URL:** http://localhost:3001/transparency

### Steps:
1. Navigate to http://localhost:3001/transparency
2. Click the **"Charts"** tab
3. Look at the **"Quarterly Lobbying Expenses"** chart (top-left)

### What to Verify:
- [ ] Chart shows dramatic Q2 spike (NOT a flat line)
- [ ] Q1 should be low (~$687)
- [ ] Q2 should be HIGH (~$6,215) - about 9x increase
- [ ] Q3 should be moderate (~$2,247)
- [ ] Visual difference should be obvious on the graph

### Expected Visual:
```
     |
$6K  |     ┌─┐
     |     │ │
$4K  |     │ │
     |     │ │              ┌─┐
$2K  |     │ │              │ │
     | ┌─┐ │ │              │ │
$0   | │ │ │ │              │ │
     └─┴─┴─┴─┴──────────────┴─┴─
       Q1  Q2              Q3
```

---

## ✅ Issue 2: Board Calendar Entries

### Page to Review
**URL:** http://localhost:3001/board-calendars

### Steps:
1. Navigate to http://localhost:3001/board-calendars
2. Select **Commissioner Williams** (first card)
3. Scroll to **"Quarterly Calendar Events"** section
4. Review the 3 calendar entries
5. Repeat for **Commissioner Chen** and **Commissioner Garcia**

### What to Verify:

#### Commissioner Williams (meets with John Doe - Technology):
- [ ] Event 1: "Technology Infrastructure Budget Discussion"
  - Date: 1/22/2025
  - Participants include "John Doe (TechCorp Industries)"
- [ ] Event 2: "Cybersecurity Initiative & Cloud Migration Presentation"
  - Date: 5/22/2025
  - Participants include Budget Committee
- [ ] Event 3: "AI Ethics Policy & Digital Accessibility Implementation"
  - Date: 8/25/2025
  - Participants include Technology Advisory Board

#### Commissioner Chen (meets with Jane Smith - Healthcare):
- [ ] Event 1: "Medicaid Expansion & Mental Health Services Planning"
  - Date: 2/19/2025
  - Participants include "Jane Smith (Healthcare Advocates Group)"
- [ ] Event 2: "Behavioral Health Budget Proposal Review"
  - Date: 5/18/2025
  - Participants include Budget Committee
- [ ] Event 3: "Health Equity Initiatives Implementation Discussion"
  - Date: 8/20/2025
  - Participants include Public Health Leadership

#### Commissioner Garcia (meets with Michael Chen - Environment):
- [ ] Event 1: "Renewable Energy & EV Infrastructure Planning"
  - Date: 2/25/2025
  - Participants include "Michael Chen (Green Energy Coalition)"
- [ ] Event 2: "Climate Action Package & Green Building Standards"
  - Date: 5/28/2025
  - Participants include Budget Committee
- [ ] Event 3: "Urban Forestry & Stormwater Management Project Updates"
  - Date: 8/28/2025
  - Participants include Environmental Services Director

### What NOT to See:
- ❌ NO "Board Meeting 1, 2, 3" entries
- ❌ NO generic "County staff, Community members, Stakeholder X" text
- ✅ SHOULD see specific lobbyist names in participants
- ✅ SHOULD see realistic policy topics in titles

---

## 🎯 Additional Pages to Check

### 3. Transparency Dashboard - Overview Tab
**URL:** http://localhost:3001/transparency (Overview tab)

#### Check:
- [ ] Summary cards show correct totals
- [ ] Total Expenses card shows larger number (increased from ~$3.5K to ~$9.1K)

### 4. Transparency Dashboard - Details Tab
**URL:** http://localhost:3001/transparency (Details tab)

#### Check:
- [ ] "Quarterly Breakdown" table shows:
  - 2025 Q1: $687
  - 2025 Q2: $6,215
  - 2025 Q3: $2,247

---

## 📝 Review Notes

### If Everything Looks Good:
The demo data improvements are working correctly and ready to deploy.

### If Issues Found:
Document what's wrong:
- Which page?
- What's displaying incorrectly?
- Screenshot if helpful

---

## 🚀 Next Steps After Review

### If Approved:
1. Commit changes to git
2. Push to `develop` branch (auto-deploys to dev environment)
3. Test on dev environment
4. Merge to `main` and deploy to production

### Commands to Deploy:
```bash
# Commit changes
git add prisma/seed.ts scripts/check-seed-data.ts
git commit -m "feat: improve demo data with dramatic expense variation and realistic board calendar entries"

# Push to develop (auto-deploys)
git push origin develop

# After dev testing, merge to main
git checkout main
git merge develop
git push origin main
```

---

## 📊 Data Summary

### Old Data (BEFORE):
- Q1: $1,125 | Q2: $1,225 | Q3: $1,208 (flat line, ~$1,200 average)
- Board calendars: "Board Meeting 1, 2, 3" (generic, not lobbying-specific)

### New Data (AFTER):
- Q1: $687 | Q2: $6,215 | Q3: $2,247 (dramatic Q2 spike, 9x increase)
- Board calendars: Specific policy topics with lobbyist names (§3.001 compliant)

### Visual Impact:
- **Charts:** Now show meaningful lobbying cycle trends
- **Calendars:** Now show actual transparency (who influenced whom, on what topics)
