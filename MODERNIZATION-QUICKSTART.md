# Modernization Quickstart Guide

**TL;DR:** 8-week plan to make your project production-ready for government use.

---

## What Was Created

1. **MODERNIZATION-ROADMAP.md** - Full 40-day detailed roadmap
2. **Beads Issues** - 4 phase tracking issues with dependencies

---

## Quick Status Check

```bash
# See what's ready to work on
bd ready

# See what's blocked
bd blocked

# See all modernization issues
bd list | grep -i "phase"
```

---

## The Plan (8 Weeks)

### ✅ Phase 1: Code Quality (Weeks 1-2)
**Beads Issue:** `lobbyist-registration-32`
**Status:** Ready to start NOW

**What:** Prettier, Husky, fix all TypeScript/ESLint errors
**Why:** Prevent bugs from reaching production
**Start:** `bd update lobbyist-registration-32 --status in-progress`

---

### ⏳ Phase 2: Testing (Weeks 3-4)
**Beads Issue:** `lobbyist-registration-33`
**Status:** Blocked until Phase 1 completes

**What:** Vitest setup, 80% code coverage
**Why:** Fast feedback, safe refactoring
**Start After:** Phase 1 done → `bd close lobbyist-registration-32`

---

### ⏳ Phase 3: Infrastructure (Weeks 5-6)
**Beads Issue:** `lobbyist-registration-34`
**Status:** Blocked until Phase 2 completes

**What:** PostgreSQL, GitHub Actions, Dependabot
**Why:** Production-grade database, automated quality checks
**Start After:** Phase 2 done → `bd close lobbyist-registration-33`

---

### ⏳ Phase 4: Security & Monitoring (Weeks 7-8)
**Beads Issue:** `lobbyist-registration-35`
**Status:** Blocked until Phase 3 completes

**What:** Sentry, Secret Manager, security scanning
**Why:** Know about errors immediately, encrypted secrets
**Start After:** Phase 3 done → `bd close lobbyist-registration-34`

---

## Starting Today

### Day 1: Prettier Setup (2 hours)

```bash
# 1. Start the phase
bd update lobbyist-registration-32 --status in-progress

# 2. Install Prettier
npm install -D prettier prettier-plugin-tailwindcss

# 3. Create config
cat > .prettierrc.json << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

# 4. Create ignore file
cat > .prettierignore << 'EOF'
.next
node_modules
.beads
*.md
package-lock.json
EOF

# 5. Format everything
npx prettier --write .

# 6. Add scripts to package.json
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."

# 7. Test it
npm run format:check
```

**Expected Result:** All files formatted consistently

---

### Day 2: Pre-Commit Hooks (2 hours)

```bash
# 1. Install tools
npm install -D husky lint-staged

# 2. Initialize Husky
npx husky init

# 3. Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
npx lint-staged
EOF

chmod +x .husky/pre-commit

# 4. Configure lint-staged in package.json
npm pkg set lint-staged='{"*.{ts,tsx}": ["eslint --fix", "prettier --write"], "*.{json,md}": ["prettier --write"]}'

# 5. Test it (try to commit bad code)
echo "const bad   =    'formatting'" > test.ts
git add test.ts
git commit -m "test: verify hooks work"
# Should auto-format the file!

rm test.ts
```

**Expected Result:** Cannot commit poorly formatted code

---

## Weekly Workflow

### Monday
- Review `bd ready` - see what's available
- Pick next task from current phase
- Mark as in-progress: `bd update <id> --status in-progress`

### During Week
- Work on tasks
- Commit frequently (hooks keep quality high)
- Update issue with progress notes

### Friday
- Complete tasks: `bd close <id>`
- Review `bd blocked` - see what's unblocked
- Plan next week

---

## Key Commands

```bash
# See what to work on next
bd ready

# Start working on something
bd update lobbyist-registration-32 --status in-progress

# Finish a task
bd close lobbyist-registration-32

# See dependency chain
bd blocked

# See all issues
bd list

# Add notes to an issue
bd update <id> --notes "Completed Prettier setup, all files formatted"
```

---

## Success Metrics (How You'll Know It's Working)

### After Phase 1 (Week 2)
- ✅ `npm run build` fails if code has errors
- ✅ Cannot commit poorly formatted code
- ✅ All commits follow conventional format

### After Phase 2 (Week 4)
- ✅ `npm test` shows 80%+ coverage
- ✅ Tests run in <2 minutes
- ✅ CI fails if coverage drops

### After Phase 3 (Week 6)
- ✅ PostgreSQL in production (no more SQLite)
- ✅ GitHub PRs have automated checks
- ✅ Dependencies auto-update weekly

### After Phase 4 (Week 8)
- ✅ Errors appear in Sentry within 1 minute
- ✅ All secrets encrypted in Secret Manager
- ✅ Zero high/critical vulnerabilities

---

## Budget

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| Cloud SQL (PostgreSQL) | $50 | Required for production |
| Sentry | $26 | Error tracking |
| UptimeRobot | $7 | Uptime monitoring |
| Secret Manager | $1 | Negligible usage |
| **Total** | **$84/month** | ($1,008/year) |

All development tools are free (Prettier, Husky, Vitest, GitHub Actions, Dependabot).

---

## Red Flags (Stop and Ask for Help)

🚨 **Build time increases significantly** → May need to optimize configs
🚨 **Tests become flaky** → Need to review test isolation
🚨 **PostgreSQL migration loses data** → Have backup plan ready
🚨 **Sentry floods with errors** → May need to adjust filters

---

## Quick Wins (Do These First)

1. **Prettier** (Day 1, 2 hours) → Instant code consistency
2. **Pre-commit hooks** (Day 2, 2 hours) → Prevent bad commits
3. **Dependabot** (Week 6, 1 hour) → Auto security updates

---

## Full Documentation

- **Detailed Roadmap:** `MODERNIZATION-ROADMAP.md` (40 days broken down)
- **Project Context:** `CLAUDE.md` (development guidelines)
- **Current Status:** `bd list` (Beads issue tracker)

---

## Questions?

**"Can we skip a phase?"**
No - each phase builds on the previous. Phase 2 (testing) needs Phase 1 (quality gates) to work properly.

**"Can we do phases in parallel?"**
Partially - some tasks within Phase 3 and Phase 4 can overlap, but core work must be sequential.

**"What if we run out of time?"**
Priority order: Phase 1 (critical) > Phase 3 (database) > Phase 2 (testing) > Phase 4 (monitoring)

**"Can we launch without all phases?"**
Not recommended. Minimum viable: Phase 1 + Phase 3 (PostgreSQL). But you'll have no tests and no monitoring (risky).

---

**Start here:** `bd update lobbyist-registration-32 --status in-progress` and follow Day 1 instructions above.

Good luck! 🚀
