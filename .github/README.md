# GitHub Actions & Automation

This directory contains GitHub Actions workflows and Dependabot configuration for automated CI/CD.

## 🔄 Workflows

### PR Checks (`pr-checks.yml`)
Runs on every pull request to `main` or `develop` branches.

**What it checks:**
- ✅ **Code Formatting** - Prettier format check
- ✅ **Linting** - ESLint with 0 errors required
- ✅ **Type Safety** - TypeScript type checking
- ✅ **Unit Tests** - 112 Vitest tests (95.89% coverage)
- ✅ **E2E Tests** - Playwright end-to-end tests
- ✅ **Build** - Next.js production build verification
- ✅ **Coverage** - Upload to Codecov (optional)

**Jobs:**
1. `quality-checks` - Runs formatting, linting, types, unit tests, and build
2. `e2e-tests` - Runs Playwright E2E tests in parallel
3. `summary` - Reports overall status

**Artifacts:**
- Playwright test reports (30-day retention)
- Code coverage reports (uploaded to Codecov if token configured)

### CI (`ci.yml`)
Runs on every push to `main` or `develop` branches.

**What it does:**
- Same checks as PR workflow
- Monitors branch health
- Reports build sizes
- Manual trigger available via workflow_dispatch

**When to use:**
- Automatic on push to main/develop
- Manual: Go to Actions → CI → Run workflow

## 📦 Dependabot (`dependabot.yml`)

Automatically creates PRs for dependency updates.

**Schedule:** Weekly on Mondays at 9:00 AM

**What it updates:**
- 📚 **NPM packages** - Production and dev dependencies
- 🔧 **GitHub Actions** - Workflow action versions

**Grouping Strategy:**
- Production dependencies grouped by minor/patch
- Development dependencies grouped by minor/patch
- Major version updates created separately

**Ignored Updates:**
- Next.js major versions (manual review required)
- React major versions (manual review required)
- React DOM major versions (manual review required)

**PR Limit:** Maximum 10 open PRs at a time

**Labels:**
- `dependencies` - All dependency updates
- `automated` - Automated PRs
- `github-actions` - Action version updates

**Assignee:** @ianaswanson

## 🎯 How It Works

### For Pull Requests

1. Developer creates PR from feature branch → `develop`
2. GitHub Actions automatically runs `pr-checks.yml`
3. All checks must pass before merge:
   - Prettier formatting ✓
   - ESLint (0 errors) ✓
   - TypeScript types ✓
   - Unit tests (112 tests) ✓
   - E2E tests ✓
   - Build succeeds ✓
4. PR can be merged

### For Main/Develop Branches

1. Code pushed to `main` or `develop`
2. GitHub Actions runs `ci.yml`
3. Reports branch health
4. Alerts if tests fail or build breaks

### For Dependencies

1. Dependabot checks for updates every Monday 9 AM
2. Creates grouped PRs:
   - `deps: bump production dependencies` (minor/patch)
   - `deps: bump development dependencies` (minor/patch)
   - `deps: bump [package-name]` (major versions)
3. PR triggers `pr-checks.yml` workflow
4. Review and merge if tests pass

## 🛠️ Setup Required

### Optional: Codecov Integration

To enable coverage reporting:

1. Sign up at https://codecov.io
2. Add repository to Codecov
3. Get upload token
4. Add secret to GitHub:
   - Go to Settings → Secrets → Actions
   - Create `CODECOV_TOKEN` secret
   - Paste token from Codecov

Without this token, coverage upload will be skipped (not required).

### Optional: Slack Notifications

To get notified of failed builds:

```yaml
# Add to end of ci.yml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

## 📊 Viewing Results

### Check Status on PRs
Pull request page shows status checks:
- ✅ All checks passed
- ❌ Some checks failed (click Details)

### View Workflow Runs
1. Go to repository
2. Click "Actions" tab
3. Select workflow (PR Checks, CI)
4. View run details

### Download Artifacts
1. Go to workflow run
2. Scroll to "Artifacts" section
3. Download Playwright reports, coverage, etc.

## 🔍 Troubleshooting

### PR Checks Failing

**Prettier format check failed:**
```bash
npm run format
git add .
git commit -m "style: format code with Prettier"
```

**ESLint errors:**
```bash
npm run lint
# Fix errors shown
```

**TypeScript errors:**
```bash
npx tsc --noEmit
# Fix type errors
```

**Tests failing:**
```bash
npm test
# Fix failing tests
```

**Build failing:**
```bash
npm run build
# Fix build errors
```

### E2E Tests Failing

1. Check Playwright report artifact
2. Download and view HTML report
3. See screenshots/videos of failures
4. Fix issues and push again

### Dependabot PRs Failing

1. Review changes in PR
2. Check if breaking changes documented
3. Update code if needed
4. Tests will re-run automatically

## 🎓 Best Practices

### Before Creating PR

Run locally:
```bash
npm run format      # Format code
npm run lint        # Check linting
npx tsc --noEmit    # Check types
npm test            # Run unit tests
npm run build       # Verify build
npm run test:e2e    # Run E2E tests (optional)
```

This ensures PR checks will pass.

### Merging Dependabot PRs

1. Review CHANGELOG/release notes
2. Check if tests pass
3. For grouped minor/patch updates → safe to merge
4. For major updates → review breaking changes first

### Keeping Workflows Updated

Dependabot automatically updates GitHub Actions to latest versions.
Review and merge these PRs regularly.

## 📈 Metrics

**Current Test Coverage:** 95.89%
- Lines: 100%
- Functions: 100%
- Branches: 94.23%
- Statements: 95.89%

**Test Count:** 112 tests
- Unit tests: 65
- Component tests: 47
- E2E tests: ~20 (Playwright)

**Build Time:** ~2-3 minutes in CI

## 🔒 Security

### Pre-commit Hooks
Before code even reaches GitHub:
- Prettier formats code
- ESLint fixes auto-fixable issues
- Commitlint validates commit messages

### PR Checks
Code review + automated checks ensure quality.

### Branch Protection (Recommended)
Enable in Settings → Branches → Add rule for `main`:
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require review from code owners
- ✅ Dismiss stale PR reviews

## 📝 Notes

- All workflows use Node.js 20 (current LTS)
- NPM caching enabled for faster installs
- Artifacts retained for 30 days
- Dependabot PRs auto-assigned to @ianaswanson
