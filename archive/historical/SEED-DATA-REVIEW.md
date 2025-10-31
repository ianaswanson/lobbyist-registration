# Seed Data Review - Rule of 3 Pattern with Realistic Data

**Purpose:** Review all seed data before implementation to ensure it looks professional for demos.

**Pattern:** Rule of 3 (3 base entities → 9 first-level relationships → 27 second-level items)

---

## 1. User Accounts (9 total)

### Admin Account (1)
| Email | Name | Password | Role |
|-------|------|----------|------|
| admin@multnomah.gov | County Administrator | Demo2025!Admin | ADMIN |

### Approved Lobbyists (3)
| Email | Name | Password | Role | Policy Area |
|-------|------|----------|------|-------------|
| john.doe@lobbying.com | John Doe | lobbyist123 | LOBBYIST | Technology |
| jane.smith@advocacy.com | Jane Smith | lobbyist123 | LOBBYIST | Healthcare |
| michael.chen@greenlobby.org | Michael Chen | lobbyist123 | LOBBYIST | Environment |

### Pending Lobbyists (3) - For admin review workflow
| Email | Name | Password | Role | Policy Area |
|-------|------|----------|------|-------------|
| sarah.martinez@portlandadvocates.com | Sarah Martinez | lobbyist123 | LOBBYIST | Education |
| robert.johnson@transportationalliance.org | Robert Johnson | lobbyist123 | LOBBYIST | Transportation |
| emily.wong@housingfirst.org | Emily Wong | lobbyist123 | LOBBYIST | Housing |

### Employer Accounts (3)
| Email | Name | Password | Role | Organization |
|-------|------|----------|------|--------------|
| contact@techcorp.com | Sarah Johnson | employer123 | EMPLOYER | TechCorp Industries |
| info@healthadvocates.org | David Kim | employer123 | EMPLOYER | Healthcare Advocates Group |
| contact@greenenergy.org | Maria Rodriguez | employer123 | EMPLOYER | Green Energy Coalition |

### Board Members (3)
| Email | Name | Password | Role | District |
|-------|------|----------|------|----------|
| commissioner@multnomah.gov | Commissioner Williams | board123 | BOARD_MEMBER | District 3 |
| commissioner.chen@multnomah.gov | Commissioner Chen | board123 | BOARD_MEMBER | District 1 |
| commissioner.garcia@multnomah.gov | Commissioner Garcia | board123 | BOARD_MEMBER | District 2 |

### Public Account (1)
| Email | Name | Password | Role |
|-------|------|----------|------|
| public@example.com | Public User | public123 | PUBLIC |

---

## 2. Lobbyist Profiles (6 total: 3 approved + 3 pending)

### Approved Lobbyists

#### Lobbyist 1: John Doe (Technology Policy)
- **Email:** john.doe@lobbying.com
- **Phone:** 503-555-0101
- **Address:** 123 Main St, Portland, OR 97201
- **Status:** APPROVED
- **Registration Date:** January 15, 2025
- **Employer:** TechCorp Industries
- **Subjects of Interest:** Technology policy, data privacy, government IT contracts
- **Hours This Quarter:** 25.5

#### Lobbyist 2: Jane Smith (Healthcare Policy)
- **Email:** jane.smith@advocacy.com
- **Phone:** 503-555-0102
- **Address:** 456 Oak Ave, Portland, OR 97202
- **Status:** APPROVED
- **Registration Date:** February 1, 2025
- **Employer:** Healthcare Advocates Group
- **Subjects of Interest:** Healthcare funding, Medicaid expansion, mental health services
- **Hours This Quarter:** 18.0

#### Lobbyist 3: Michael Chen (Environmental Policy)
- **Email:** michael.chen@greenlobby.org
- **Phone:** 503-555-0103
- **Address:** 789 Elm St, Portland, OR 97203
- **Status:** APPROVED
- **Registration Date:** February 15, 2025
- **Employer:** Green Energy Coalition
- **Subjects of Interest:** Renewable energy policy, climate action, carbon reduction
- **Hours This Quarter:** 22.5

### Pending Lobbyists (For Admin Review Workflow)

#### Lobbyist 4: Sarah Martinez (Education Policy)
- **Email:** sarah.martinez@portlandadvocates.com
- **Phone:** 503-555-0104
- **Address:** 234 Cedar Ln, Portland, OR 97204
- **Status:** PENDING
- **Registration Date:** October 1, 2025
- **Employer:** Portland Advocates Coalition
- **Subjects of Interest:** K-12 education funding, teacher salaries, school facilities
- **Hours This Quarter:** 12.0

#### Lobbyist 5: Robert Johnson (Transportation Policy)
- **Email:** robert.johnson@transportationalliance.org
- **Phone:** 503-555-0105
- **Address:** 567 Maple Dr, Portland, OR 97205
- **Status:** PENDING
- **Registration Date:** October 5, 2025
- **Employer:** Transportation Alliance
- **Subjects of Interest:** Public transit funding, bike infrastructure, road maintenance
- **Hours This Quarter:** 15.0

#### Lobbyist 6: Emily Wong (Housing Policy)
- **Email:** emily.wong@housingfirst.org
- **Phone:** 503-555-0106
- **Address:** 890 Birch Way, Portland, OR 97206
- **Status:** PENDING
- **Registration Date:** October 10, 2025
- **Employer:** Housing First Oregon
- **Subjects of Interest:** Affordable housing, homelessness services, tenant protections
- **Hours This Quarter:** 14.0

---

## 3. Employer Organizations (3 total)

### Employer 1: TechCorp Industries
- **Contact Name:** Sarah Johnson
- **Email:** contact@techcorp.com
- **Phone:** 503-555-0201
- **Address:** 789 Business Pkwy, Portland, OR 97207
- **Business Description:** Technology consulting and software development firm specializing in government solutions
- **Lobbyists:** John Doe

### Employer 2: Healthcare Advocates Group
- **Contact Name:** David Kim
- **Email:** info@healthadvocates.org
- **Phone:** 503-555-0202
- **Address:** 321 Medical Plaza, Portland, OR 97208
- **Business Description:** Non-profit organization advocating for healthcare policy reform
- **Lobbyists:** Jane Smith

### Employer 3: Green Energy Coalition
- **Contact Name:** Maria Rodriguez
- **Email:** contact@greenenergy.org
- **Phone:** 503-555-0203
- **Address:** 444 Renewable Way, Portland, OR 97209
- **Business Description:** Environmental advocacy organization promoting renewable energy and climate action
- **Lobbyists:** Michael Chen

---

## 4. Lobbyist Expense Reports (9 total: 3 lobbyists × 3 reports each)

### John Doe (Technology Policy) - 3 Reports

#### Report 1: Q1 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** April 10, 2025
- **Due Date:** April 15, 2025
- **Total Food/Entertainment:** $335.25
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jan 22, 2025 | Jake's Famous Crawfish | Lunch meeting to discuss technology infrastructure budget priorities | $125.50 |
| Feb 15, 2025 | Portland City Grill | Dinner meeting re: IT modernization roadmap for county services | $142.75 |
| Mar 8, 2025 | Starbucks Reserve | Coffee meeting about data privacy ordinance amendments | $67.00 |

#### Report 2: Q2 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** July 12, 2025
- **Due Date:** July 15, 2025
- **Total Food/Entertainment:** $412.50
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Apr 18, 2025 | Imperial Restaurant | Lunch discussion on cybersecurity funding for county systems | $138.25 |
| May 22, 2025 | Le Pigeon | Dinner meeting about cloud migration strategy for public records | $185.00 |
| Jun 10, 2025 | Blue Star Donuts | Coffee meeting re: open data portal development | $89.25 |

#### Report 3: Q3 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** October 11, 2025
- **Due Date:** October 15, 2025
- **Total Food/Entertainment:** $378.00
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jul 19, 2025 | Screen Door | Lunch meeting about digital accessibility compliance requirements | $115.50 |
| Aug 25, 2025 | Departure Restaurant | Dinner discussion on AI ethics policy for government technology | $172.50 |
| Sep 14, 2025 | Coava Coffee | Coffee meeting re: broadband expansion in underserved areas | $90.00 |

---

### Jane Smith (Healthcare Policy) - 3 Reports

#### Report 1: Q1 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** April 13, 2025
- **Due Date:** April 15, 2025
- **Total Food/Entertainment:** $428.75
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jan 28, 2025 | Andina Restaurant | Lunch meeting to discuss Medicaid expansion funding priorities | $152.25 |
| Feb 19, 2025 | Higgins Restaurant | Dinner meeting re: mental health crisis intervention programs | $198.50 |
| Mar 15, 2025 | Heart Coffee | Coffee meeting about community health worker certification | $78.00 |

#### Report 2: Q2 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** July 14, 2025
- **Due Date:** July 15, 2025
- **Total Food/Entertainment:** $395.00
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Apr 22, 2025 | Ataula | Lunch discussion on behavioral health services integration | $142.00 |
| May 18, 2025 | Nostrana | Dinner meeting about healthcare navigator program expansion | $178.00 |
| Jun 12, 2025 | Stumptown Coffee | Coffee meeting re: maternal health outcome improvements | $75.00 |

#### Report 3: Q3 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** October 10, 2025
- **Due Date:** October 15, 2025
- **Total Food/Entertainment:** $445.50
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jul 25, 2025 | Canard | Lunch meeting about substance abuse treatment facility funding | $165.50 |
| Aug 20, 2025 | Castagna | Dinner discussion on health equity initiatives in rural areas | $205.00 |
| Sep 18, 2025 | Courier Coffee | Coffee meeting re: prescription drug assistance programs | $75.00 |

---

### Michael Chen (Environmental Policy) - 3 Reports

#### Report 1: Q1 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** April 14, 2025
- **Due Date:** April 15, 2025
- **Total Food/Entertainment:** $362.50
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jan 30, 2025 | Bamboo Sushi | Lunch meeting to discuss renewable energy incentive programs | $128.50 |
| Feb 25, 2025 | Beast Restaurant | Dinner meeting re: electric vehicle charging infrastructure | $168.00 |
| Mar 20, 2025 | Barista | Coffee meeting about solar panel permitting streamlining | $66.00 |

#### Report 2: Q2 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** July 13, 2025
- **Due Date:** July 15, 2025
- **Total Food/Entertainment:** $418.25
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Apr 24, 2025 | Oven and Shaker | Lunch discussion on carbon reduction goals for county operations | $135.25 |
| May 28, 2025 | Paley's Place | Dinner meeting about green building standards for new construction | $195.00 |
| Jun 16, 2025 | Water Avenue Coffee | Coffee meeting re: climate action plan implementation timeline | $88.00 |

#### Report 3: Q3 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** October 12, 2025
- **Due Date:** October 15, 2025
- **Total Food/Entertainment:** $385.00
- **Line Items (3):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jul 22, 2025 | Ox Restaurant | Lunch meeting about urban forestry expansion and tree preservation | $145.00 |
| Aug 28, 2025 | Ned Ludd | Dinner discussion on composting infrastructure and food waste reduction | $175.00 |
| Sep 20, 2025 | Sterling Coffee | Coffee meeting re: watershed protection and stormwater management | $65.00 |

---

## 5. Employer Expense Reports (9 total: 3 employers × 3 reports each)

### TechCorp Industries (Sarah Johnson) - 3 Reports

#### Report 1: Q1 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** April 11, 2025
- **Due Date:** April 15, 2025
- **Total Compensation:** $45,000.00
- **Line Items (3 - Payments to John Doe):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jan 31, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |
| Feb 28, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |
| Mar 31, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |

#### Report 2: Q2 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** July 11, 2025
- **Due Date:** July 15, 2025
- **Total Compensation:** $45,000.00
- **Line Items (3 - Payments to John Doe):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Apr 30, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |
| May 31, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |
| Jun 30, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |

#### Report 3: Q3 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** October 10, 2025
- **Due Date:** October 15, 2025
- **Total Compensation:** $45,000.00
- **Line Items (3 - Payments to John Doe):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jul 31, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |
| Aug 31, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |
| Sep 30, 2025 | John Doe | Monthly retainer - Technology policy advocacy | $15,000.00 |

---

### Healthcare Advocates Group (David Kim) - 3 Reports

#### Report 1: Q1 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** April 12, 2025
- **Due Date:** April 15, 2025
- **Total Compensation:** $38,000.00
- **Line Items (3 - Payments to Jane Smith):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jan 31, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.67 |
| Feb 28, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.67 |
| Mar 31, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.66 |

#### Report 2: Q2 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** July 12, 2025
- **Due Date:** July 15, 2025
- **Total Compensation:** $38,000.00
- **Line Items (3 - Payments to Jane Smith):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Apr 30, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.67 |
| May 31, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.67 |
| Jun 30, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.66 |

#### Report 3: Q3 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** October 11, 2025
- **Due Date:** October 15, 2025
- **Total Compensation:** $38,000.00
- **Line Items (3 - Payments to Jane Smith):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jul 31, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.67 |
| Aug 31, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.67 |
| Sep 30, 2025 | Jane Smith | Monthly retainer - Healthcare policy advocacy | $12,666.66 |

---

### Green Energy Coalition (Maria Rodriguez) - 3 Reports

#### Report 1: Q1 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** April 13, 2025
- **Due Date:** April 15, 2025
- **Total Compensation:** $42,000.00
- **Line Items (3 - Payments to Michael Chen):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jan 31, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |
| Feb 28, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |
| Mar 31, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |

#### Report 2: Q2 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** July 13, 2025
- **Due Date:** July 15, 2025
- **Total Compensation:** $42,000.00
- **Line Items (3 - Payments to Michael Chen):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Apr 30, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |
| May 31, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |
| Jun 30, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |

#### Report 3: Q3 2025 (APPROVED)
- **Status:** APPROVED
- **Submitted:** October 12, 2025
- **Due Date:** October 15, 2025
- **Total Compensation:** $42,000.00
- **Line Items (3 - Payments to Michael Chen):**

| Date | Payee | Purpose | Amount |
|------|-------|---------|--------|
| Jul 31, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |
| Aug 31, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |
| Sep 30, 2025 | Michael Chen | Monthly retainer - Environmental policy advocacy | $14,000.00 |

---

## 6. Board Members (3 total)

### Board Member 1: Commissioner Williams
- **Email:** commissioner@multnomah.gov
- **District:** District 3
- **Term Start:** January 1, 2023
- **Active:** Yes
- **Calendar Entries:** 3
- **Receipts:** 3

### Board Member 2: Commissioner Chen
- **Email:** commissioner.chen@multnomah.gov
- **District:** District 1
- **Term Start:** January 1, 2022
- **Active:** Yes
- **Calendar Entries:** 3
- **Receipts:** 3

### Board Member 3: Commissioner Garcia
- **Email:** commissioner.garcia@multnomah.gov
- **District:** District 2
- **Term Start:** January 1, 2024
- **Active:** Yes
- **Calendar Entries:** 3
- **Receipts:** 3

---

## 7. Board Calendar Entries (9 total: 3 board members × 3 entries each)

### Commissioner Williams - 3 Entries

| Date | Time | Title | Description | Meeting Type | Participants |
|------|------|-------|-------------|--------------|--------------|
| Jan 15, 2025 | 10:00 AM | Technology Infrastructure Planning | Discussion of county IT modernization roadmap and cybersecurity improvements | In-Person | John Doe (TechCorp Industries) |
| Feb 20, 2025 | 2:00 PM | Smart City Initiative | Review of smart city technology proposals and digital equity considerations | Virtual | Sarah Johnson (TechCorp Industries) |
| Mar 10, 2025 | 11:00 AM | Broadband Expansion | Planning for broadband expansion in underserved rural areas | In-Person | John Doe (TechCorp Industries) |

### Commissioner Chen - 3 Entries

| Date | Time | Title | Description | Meeting Type | Participants |
|------|------|-------|-------------|--------------|--------------|
| Jan 25, 2025 | 9:00 AM | Healthcare Access Review | Discussion of healthcare access barriers and potential policy solutions | In-Person | Jane Smith (Healthcare Advocates Group) |
| Feb 28, 2025 | 1:00 PM | Mental Health Services | Review of mental health crisis intervention program expansion | Virtual | David Kim (Healthcare Advocates Group) |
| Mar 18, 2025 | 10:30 AM | Medicaid Planning | Planning for Medicaid expansion implementation and outreach | In-Person | Jane Smith (Healthcare Advocates Group) |

### Commissioner Garcia - 3 Entries

| Date | Time | Title | Description | Meeting Type | Participants |
|------|------|-------|-------------|--------------|--------------|
| Feb 5, 2025 | 2:00 PM | Climate Action Strategy | Review of county climate action plan and carbon reduction targets | In-Person | Michael Chen (Green Energy Coalition) |
| Mar 8, 2025 | 3:00 PM | Renewable Energy Policy | Discussion of solar and wind energy incentive program development | Virtual | Maria Rodriguez (Green Energy Coalition) |
| Apr 12, 2025 | 11:00 AM | Green Building Standards | Planning for updated green building requirements for county projects | In-Person | Michael Chen (Green Energy Coalition) |

---

## 8. Board Lobbying Receipts (9 total: 3 board members × 3 receipts each)

### Commissioner Williams - 3 Receipts

| Date | From Lobbyist | Subject | Value | Description |
|------|--------------|---------|-------|-------------|
| Jan 22, 2025 | John Doe | Technology Infrastructure | $125.50 | Lunch at Jake's Famous Crawfish to discuss IT budget priorities |
| Feb 15, 2025 | John Doe | IT Modernization | $142.75 | Dinner at Portland City Grill re: county IT modernization roadmap |
| Mar 8, 2025 | John Doe | Data Privacy | $67.00 | Coffee at Starbucks Reserve about data privacy ordinance |

### Commissioner Chen - 3 Receipts

| Date | From Lobbyist | Subject | Value | Description |
|------|--------------|---------|-------|-------------|
| Jan 28, 2025 | Jane Smith | Medicaid Expansion | $152.25 | Lunch at Andina Restaurant to discuss Medicaid funding priorities |
| Feb 19, 2025 | Jane Smith | Mental Health | $198.50 | Dinner at Higgins Restaurant re: mental health crisis programs |
| Mar 15, 2025 | Jane Smith | Community Health Workers | $78.00 | Coffee at Heart Coffee about health worker certification |

### Commissioner Garcia - 3 Receipts

| Date | From Lobbyist | Subject | Value | Description |
|------|--------------|---------|-------|-------------|
| Jan 30, 2025 | Michael Chen | Renewable Energy | $128.50 | Lunch at Bamboo Sushi to discuss renewable energy incentive programs |
| Feb 25, 2025 | Michael Chen | EV Infrastructure | $168.00 | Dinner at Beast Restaurant re: electric vehicle charging infrastructure |
| Mar 20, 2025 | Michael Chen | Solar Permitting | $66.00 | Coffee at Barista about solar panel permitting streamlining |

---

## 9. Violations (3 total)

### Violation 1: Late Report Filing
- **Lobbyist:** John Doe
- **Type:** LATE_FILING
- **Status:** ISSUED
- **Issue Date:** May 1, 2025
- **Fine Amount:** $150.00
- **Description:** Q4 2024 expense report submitted 3 days late (due April 15, submitted April 18)
- **Resolution:** Fine paid May 5, 2025

### Violation 2: Incomplete Registration
- **Lobbyist:** Jane Smith
- **Type:** INCOMPLETE_REGISTRATION
- **Status:** RESOLVED
- **Issue Date:** March 15, 2025
- **Fine Amount:** $100.00
- **Description:** Missing employer authorization document for Healthcare Advocates Group
- **Resolution:** Document submitted March 18, fine waived

### Violation 3: Missing Expense Details
- **Lobbyist:** Michael Chen
- **Type:** MISSING_EXPENSE_DETAILS
- **Status:** APPEALED
- **Issue Date:** August 1, 2025
- **Fine Amount:** $200.00
- **Description:** Q2 2025 report missing required itemization for 2 expenses over $50
- **Resolution:** Under appeal, pending review

---

## 10. Appeals (3 total)

### Appeal 1: Late Filing - John Doe
- **Violation:** Late Report Filing (#1)
- **Status:** DENIED
- **Filed Date:** May 3, 2025
- **Appeal Reason:** "Report was submitted via mail and postmarked April 14, but County office received it April 18 due to mail delays beyond my control."
- **Decision Date:** May 15, 2025
- **Decision Reason:** "Email submission option was available and deadline clearly stated. Mail delays are not sufficient grounds for appeal. Fine upheld."

### Appeal 2: Incomplete Registration - Jane Smith
- **Violation:** Incomplete Registration (#2)
- **Status:** APPROVED
- **Filed Date:** March 16, 2025
- **Appeal Reason:** "Authorization document was submitted with original registration on February 1. County records show document was received but not properly filed."
- **Decision Date:** March 18, 2025
- **Decision Reason:** "County records confirm document was received on February 1. Administrative error on County's part. Fine waived and violation dismissed."

### Appeal 3: Missing Expense Details - Michael Chen
- **Violation:** Missing Expense Details (#3)
- **Status:** PENDING
- **Filed Date:** August 10, 2025
- **Appeal Reason:** "The two expenses in question were $52 and $55, just barely over the $50 threshold. Original descriptions provided sufficient detail about the nature of the expenses. Request for additional itemization is overly burdensome for such small amounts."
- **Decision Date:** null
- **Decision Reason:** null

---

## 11. Contract Exceptions (3 total) - §9.230 Compliance

### Exception 1: Former County IT Director
- **Name:** Robert Thompson
- **Former Position:** IT Director, Multnomah County
- **Left County Employment:** December 31, 2023
- **Contract Start Date:** February 1, 2025 (13 months later)
- **Current Employer:** TechCorp Industries
- **Contract Subject:** County IT modernization consulting
- **Contract Value:** $75,000
- **Justification:** "Mr. Thompson's specialized knowledge of county IT infrastructure is essential for successful modernization. 13-month cooling-off period exceeds 12-month minimum."
- **Status:** APPROVED
- **Posted Date:** January 15, 2025

### Exception 2: Former Health Services Manager
- **Name:** Patricia Williams
- **Former Position:** Health Services Manager
- **Left County Employment:** June 30, 2024
- **Contract Start Date:** August 1, 2025 (13 months later)
- **Current Employer:** Healthcare Advocates Group
- **Contract Subject:** Healthcare navigator program development
- **Contract Value:** $45,000
- **Justification:** "Ms. Williams' expertise in healthcare program administration and knowledge of county systems is critical for navigator program success."
- **Status:** APPROVED
- **Posted Date:** July 20, 2025

### Exception 3: Former Environmental Programs Coordinator
- **Name:** James Martinez
- **Former Position:** Environmental Programs Coordinator
- **Left County Employment:** March 31, 2024
- **Contract Start Date:** May 1, 2025 (13 months later)
- **Current Employer:** Green Energy Coalition
- **Contract Subject:** Climate action plan implementation consulting
- **Contract Value:** $52,000
- **Justification:** "Mr. Martinez's institutional knowledge of county environmental programs and stakeholder relationships is invaluable for climate action plan rollout."
- **Status:** APPROVED
- **Posted Date:** April 15, 2025

---

## 12. Hour Tracking Logs (9 total: 3 lobbyists × 3 logs each)

### John Doe - 3 Hour Logs (Q4 2025)

| Week Ending | Hours | Activities | Officials Contacted |
|-------------|-------|------------|-------------------|
| Oct 4, 2025 | 8.5 | Researched county IT budget priorities; drafted policy memo on cybersecurity funding | Commissioner Williams, IT Director |
| Oct 11, 2025 | 7.0 | Met with Commissioner Williams; attended public hearing on technology contracts | Commissioner Williams |
| Oct 18, 2025 | 10.0 | Prepared testimony for budget hearing; met with county staff on data privacy policy | Commissioner Williams, County Attorney |

### Jane Smith - 3 Hour Logs (Q4 2025)

| Week Ending | Hours | Activities | Officials Contacted |
|-------------|-------|------------|-------------------|
| Oct 4, 2025 | 6.5 | Researched Medicaid expansion options; analyzed county healthcare funding gaps | Commissioner Chen, Health Director |
| Oct 11, 2025 | 5.5 | Met with Commissioner Chen; drafted policy proposal on mental health services | Commissioner Chen |
| Oct 18, 2025 | 6.0 | Attended healthcare stakeholder meeting; prepared budget testimony | Commissioner Chen, Budget Director |

### Michael Chen - 3 Hour Logs (Q4 2025)

| Week Ending | Hours | Activities | Officials Contacted |
|-------------|-------|------------|-------------------|
| Oct 4, 2025 | 7.5 | Researched renewable energy incentive programs; reviewed climate action plan | Commissioner Garcia, Sustainability Manager |
| Oct 11, 2025 | 7.5 | Met with Commissioner Garcia; attended public hearing on green building standards | Commissioner Garcia |
| Oct 18, 2025 | 7.5 | Prepared testimony on carbon reduction goals; met with county planners | Commissioner Garcia, Planning Director |

---

## Summary: Rule of 3 Verification

### Base Level (3 each)
- ✅ 3 Approved Lobbyists (+ 3 pending)
- ✅ 3 Employers
- ✅ 3 Board Members
- ✅ 3 Violations
- ✅ 3 Appeals
- ✅ 3 Contract Exceptions

### First Relationship Level (9 each)
- ✅ 9 Lobbyist Reports (3 lobbyists × 3 reports)
- ✅ 9 Employer Reports (3 employers × 3 reports)
- ✅ 9 Board Calendar Entries (3 board members × 3 entries)
- ✅ 9 Board Receipts (3 board members × 3 receipts)
- ✅ 9 Hour Logs (3 lobbyists × 3 logs)

### Second Relationship Level (27 each)
- ✅ 27 Lobbyist Expense Line Items (9 reports × 3 items)
- ✅ 27 Employer Payment Line Items (9 reports × 3 items)

---

## Story Coherence Check

### John Doe (Technology Policy)
- ✅ All 9 expense items relate to technology policy
- ✅ Meets consistently with Commissioner Williams (District 3)
- ✅ Works for TechCorp Industries
- ✅ Real Portland restaurants used
- ✅ Realistic expense amounts ($65-$205)
- ✅ Policy topics tell a coherent story (IT modernization, cybersecurity, broadband)

### Jane Smith (Healthcare Policy)
- ✅ All 9 expense items relate to healthcare policy
- ✅ Meets consistently with Commissioner Chen (District 1)
- ✅ Works for Healthcare Advocates Group
- ✅ Real Portland restaurants used
- ✅ Realistic expense amounts ($75-$205)
- ✅ Policy topics tell a coherent story (Medicaid, mental health, health equity)

### Michael Chen (Environmental Policy)
- ✅ All 9 expense items relate to environmental policy
- ✅ Meets consistently with Commissioner Garcia (District 2)
- ✅ Works for Green Energy Coalition
- ✅ Real Portland restaurants used
- ✅ Realistic expense amounts ($65-$195)
- ✅ Policy topics tell a coherent story (renewable energy, climate action, green building)

---

## Next Steps

1. **Review this document** - Check for any unrealistic data or issues
2. **Approve or request changes** - Let me know what to adjust
3. **Implement seed script** - I'll update prisma/seed.ts with this data
4. **Test locally** - Run `npm run db:reset` to verify
5. **Deploy to cloud** - Push to develop branch with FORCE_RESEED flag

**Questions to answer:**
- Does the data look professional enough for stakeholder demos?
- Are the expense descriptions realistic and clear?
- Are the policy areas well-represented?
- Any specific changes you'd like to see?
