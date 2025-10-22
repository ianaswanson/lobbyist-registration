# Architecture Decisions
## Strategic Constraints for LLM-Assisted Development

**Document Purpose:** Define architectural constraints that enable fast, consistent, low-error development when working with AI coding assistants.

**Last Updated:** October 21, 2025
**Project:** Multnomah County Lobbyist Registration System

---

## 🧠 The Philosophy: Why Constraints Enable "Vibe Coding"

### The Pattern We Discovered

**Database Work (Smooth Experience):**
- ✅ Made architectural decision upfront (Prisma + migrations)
- ✅ Established "golden rule" (schema changes only via migrations)
- ✅ Used opinionated framework with constraints
- ✅ **Result:** 35+ database-related tasks with zero major issues

**API Work (Clunky Experience):**
- ❌ No architectural decision made upfront
- ❌ No established patterns or rules
- ❌ Used flexible framework without constraints
- ❌ **Result:** Every API felt like starting from scratch, high error rate

### The Core Insight

When working with LLMs in "vibe coding" mode:

**Constraints = Velocity**

```
┌─────────────────────────────────────────────────────────────┐
│                  WITH UPFRONT DECISIONS                      │
├─────────────────────────────────────────────────────────────┤
│ Developer: "Add expense report form"                        │
│                                                              │
│ LLM knows exactly what to do:                               │
│  - Use React Hook Form + Zod (decision #6)                  │
│  - Fetch data with TanStack Query (decision #7)             │
│  - Save via tRPC mutation (decision #2)                     │
│  - Show errors in error boundary (decision #8)              │
│  - Style with shadcn components (decision #5)               │
│                                                              │
│ Result: Fast, consistent, follows established patterns      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 WITHOUT UPFRONT DECISIONS                    │
├─────────────────────────────────────────────────────────────┤
│ Developer: "Add expense report form"                        │
│                                                              │
│ LLM must decide every time:                                 │
│  - How should I handle form state? (re-decides)             │
│  - How should I validate? (re-decides)                      │
│  - How should I fetch data? (re-decides)                    │
│  - How should I save data? (re-decides)                     │
│  - How should I show errors? (re-decides)                   │
│                                                              │
│ Result: Slow, inconsistent, different patterns each time    │
└─────────────────────────────────────────────────────────────┘
```

### Why This Happens

**LLMs are pattern-followers, not decision-makers.**

- ✅ **Give an LLM a pattern:** It will replicate it consistently and fast
- ❌ **Give an LLM freedom:** It will make different choices each time

**Traditional software development:** "Stay flexible, decide as you go"
**LLM-assisted development:** "Decide upfront, execute within constraints"

The **lack of flexibility is actually an advantage** when working with AI.

---

## 📋 The Framework: 12 Critical Decisions

These are the decisions that, if made upfront, prevent the "clunky API experience" across your entire codebase.

### Decision Categories

| Category | Risk if Deferred | Impact on LLM Coding |
|----------|------------------|---------------------|
| 1. Database Layer | Data corruption, inconsistent schema | High - LLM re-invents migrations |
| 2. API Layer | Inconsistent endpoints, no type safety | High - LLM re-decides validation every time |
| 3. UI Components | Inconsistent styling, accessibility issues | Medium - LLM picks different libraries |
| 4. Data Fetching | Duplicate requests, no caching, messy code | High - LLM writes different patterns each time |
| 5. Auth & Permissions | Security holes, inconsistent checks | High - LLM forgets auth checks |
| 6. Form Handling | Different validation approaches, poor UX | Medium - LLM re-writes form logic |
| 7. Testing Strategy | No coverage, flaky tests | Low - But causes tech debt |
| 8. TypeScript Strictness | Runtime errors, weak types | High - LLM uses 'any' everywhere |
| 9. File Structure | Code hard to find, mixed concerns | Medium - LLM puts files in wrong places |
| 10. Error Handling | Errors swallowed, no logging, bad UX | High - LLM writes different error handling |
| 11. Code Formatting | Inconsistent style, messy diffs | Low - But slows reviews |
| 12. Deployment & Environments | Manual deploys, secret leaks | Medium - LLM can't automate deploys |

---

## ✅ Decisions Made for This Project

### 1. Database Layer ✅ (EXCELLENT)

**Decision:** Prisma ORM + SQLite (prototype) → PostgreSQL (production)
**Migration Strategy:** Version-controlled migrations only
**Type Generation:** Automatic via `prisma generate`

**Golden Rule:**
> "Schema changes ONLY through migration files. Never manually alter database."

**Why This Worked:**
- Single source of truth (`schema.prisma`)
- Enforced discipline (can't bypass migrations)
- Automatic TypeScript types
- Clear error messages when rules violated

**Implementation:**
```bash
# To change schema:
1. Edit prisma/schema.prisma
2. Run: npm run prisma:migrate dev --name descriptive_name
3. Commit migration file
```

**Status:** ✅ This decision prevented 100+ potential database errors

---

### 2. API Layer ⚠️ (NEEDS IMPROVEMENT)

**Current State:** Next.js API Routes + Manual validation
**Problem:** Every API endpoint re-invents validation, error handling, response format

**What We Should Have Decided:**
- [ ] Validation library (Zod recommended)
- [ ] Error handling pattern
- [ ] Request/response structure
- [ ] Auth middleware approach

**Modern Recommendation:**

**Option A: tRPC (Most Constrained - Best for LLM)**
```typescript
// Pros: End-to-end type safety, automatic validation, no decision fatigue
// Cons: Opinionated, requires learning tRPC patterns

const appRouter = router({
  getReports: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input, ctx }) => {
      return prisma.report.findMany({ where: { userId: input.userId }})
    })
})

// Client gets full type safety automatically
const reports = await trpc.getReports.query({ userId: '123' })
```

**Option B: Standard API Helpers (More Flexible)**
```typescript
// lib/api-helpers.ts - ONE implementation, reused everywhere

export function validateRequest<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) throw new ApiError(400, result.error.message)
  return result.data
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  // Log to Sentry
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export async function requireAuth(req: Request): Promise<User> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new ApiError(401, 'Unauthorized')
  return session.user
}
```

**Golden Rule (Proposed):**
> "All API routes must use Zod for validation and api-helpers for error handling"

**TODO:** Add this to Phase 1 or 2 of modernization roadmap

**Status:** ⚠️ Partially implemented, needs standardization

---

### 3. UI Component Strategy ✅ (EXCELLENT)

**Decision:** shadcn/ui + Tailwind CSS + Lucide icons
**Styling:** Utility-first with Tailwind
**Accessibility:** Built into shadcn components (WCAG 2.1 AA)

**Golden Rule:**
> "Use shadcn/ui components as base, extend with Tailwind utilities"

**Why This Worked:**
- Pre-built accessible components
- Copy-paste simplicity (no npm bloat)
- Consistent design system
- AI can easily replicate patterns

**Implementation:**
```bash
# Add new component
npx shadcn-ui@latest add button

# Use in code
import { Button } from "@/components/ui/button"
<Button variant="outline">Click me</Button>
```

**Status:** ✅ Consistent UI across all pages

---

### 4. Data Fetching & Caching ⚠️ (NEEDS IMPROVEMENT)

**Current State:** Manual `fetch()` calls, no caching, scattered loading states
**Problem:** Every data fetch re-invents loading/error/refetch logic

**Modern Recommendation:**

**TanStack Query (React Query)**
```typescript
// Automatic caching, refetch logic, loading/error states built-in

const { data, isLoading, error } = useQuery({
  queryKey: ['reports', userId],
  queryFn: () => fetchReports(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Mutations with automatic cache updates
const mutation = useMutation({
  mutationFn: createReport,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }
})
```

**Golden Rule (Proposed):**
> "All server data fetched via useQuery/useMutation, no manual fetch() calls"

**Why This Helps LLM Coding:**
Without this: LLM re-writes loading/error/caching logic every single time
With this: LLM just uses the same `useQuery` pattern everywhere

**TODO:** Add TanStack Query to Phase 2 of modernization

**Status:** ⚠️ Not implemented, causing repetitive code

---

### 5. Authentication & Authorization ⚠️ (PARTIALLY DONE)

**Decision:** NextAuth.js v5
**Session Storage:** Database sessions
**Role-Based Access:** UserRole enum (PUBLIC, LOBBYIST, EMPLOYER, BOARD_MEMBER, ADMIN)

**What's Missing:**
- [ ] Standard permission checking pattern
- [ ] Protected route wrapper
- [ ] Consistent auth error handling

**Proposed Helpers:**
```typescript
// lib/auth-helpers.ts

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Insufficient permissions')
  }
  return session.user
}

export function checkPermission(user: User, action: string, resource: string): boolean {
  // Centralized permission logic
  // Example: LOBBYIST can edit own reports, ADMIN can edit all reports
}
```

**Golden Rule (Proposed):**
> "All protected pages use requireRole(), all permission checks use checkPermission()"

**Status:** ⚠️ Auth works but patterns not standardized

---

### 6. Form Handling ⚠️ (NEEDS IMPROVEMENT)

**Current State:** Mix of controlled components, manual validation, scattered error handling
**Problem:** Every form feels different, validation approaches vary

**Modern Recommendation:**

**React Hook Form + Zod + shadcn Form**
```typescript
// Define schema once
const formSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
})

// Use everywhere
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '', amount: 0 }
})

// Standard pattern
<Form {...form}>
  <FormField name="email" control={form.control} render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )} />
</Form>
```

**Golden Rule (Proposed):**
> "All forms use React Hook Form + Zod, no manual state management"

**Why This Helps:**
- Same pattern every time → LLM can replicate instantly
- Type-safe validation → Fewer runtime errors
- Consistent error display → Better UX

**TODO:** Install react-hook-form, standardize all forms

**Status:** ⚠️ Some forms follow this, many don't

---

### 7. Testing Strategy ⚠️ (PARTIALLY DONE)

**Decision:** Playwright for E2E testing
**Coverage:** 10 E2E test files covering critical user workflows

**What's Missing:**
- [ ] Unit testing framework (Vitest recommended)
- [ ] Coverage thresholds (80% recommended)
- [ ] Component testing strategy
- [ ] API route testing

**Modern Recommendation:**
```
E2E Tests (Playwright): Critical user workflows
Integration Tests (Vitest): API routes, complex components
Unit Tests (Vitest): Business logic in /lib

Coverage Target: 80% for lib/, 60% for components/, 100% E2E for critical paths
```

**Golden Rule (Proposed):**
> "All business logic in /lib must have unit tests before PR merge"

**Status:** ⚠️ Good E2E coverage, zero unit tests (Phase 2 of modernization addresses this)

---

### 8. TypeScript Strictness ✅ (GOOD, NEEDS ENFORCEMENT)

**Decision:** TypeScript with strict mode enabled
**Type Sharing:** Prisma generates database types automatically

**Current Issue:** Build quality gates disabled (`ignoreBuildErrors: true`)
**Problem:** TypeScript errors exist but don't block builds

**Golden Rule:**
> "No 'any' types without explicit justification comment. Build fails on type errors."

**Status:** ✅ Strict mode enabled, ⚠️ enforcement disabled (Phase 1 of modernization fixes this)

---

### 9. File Structure & Naming ✅ (EXCELLENT)

**Decision:**
```
/app                    - Next.js 15 App Router pages (routes)
/components             - Reusable UI components
  /ui                   - shadcn/ui base components
  /reports              - Domain-specific components
/lib                    - Business logic, utilities, helpers
/prisma                 - Database schema and migrations
/public                 - Static assets
/types                  - Shared TypeScript type definitions
```

**Naming Conventions:**
- Components: PascalCase (`ExpenseReportForm.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- API routes: kebab-case (`/api/reports/[id]/route.ts`)

**Golden Rule:**
> "Business logic in /lib, UI in /components, never mix concerns"

**Status:** ✅ Consistent structure throughout

---

### 10. Error Handling ❌ (NEEDS IMPLEMENTATION)

**Current State:** Errors handled inconsistently - console.log, alert(), try-catch scattered
**Problem:** No standard way to show errors to users, no error tracking

**Modern Recommendation:**

**Client-Side:**
```typescript
// app/error.tsx - React Error Boundary
'use client'
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to Sentry
    logErrorToSentry(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Server-Side:**
```typescript
// lib/error-handler.ts
export function handleError(error: unknown, context: string) {
  // Log to Sentry
  logToSentry(error, context)

  // Return user-friendly message
  if (error instanceof PrismaClientKnownRequestError) {
    return { message: 'Database error', code: 'DB_ERROR' }
  }
  return { message: 'An unexpected error occurred', code: 'UNKNOWN' }
}
```

**Golden Rule (Proposed):**
> "All errors caught by error boundary or logged to Sentry. No silent failures."

**TODO:** Add error boundaries, integrate Sentry (Phase 4 of modernization)

**Status:** ❌ No standard error handling

---

### 11. Code Formatting & Quality ⚠️ (IN PROGRESS)

**Current State:** No automated formatting, build quality gates disabled
**Problem:** Inconsistent code style, errors slip through

**Decision (Phase 1 of Modernization):**
- **Formatter:** Prettier + Tailwind plugin
- **Linter:** ESLint (Next.js config)
- **Pre-commit:** Husky + lint-staged
- **Import Ordering:** Auto-sort with eslint-plugin-import

**Golden Rule:**
> "Pre-commit hook prevents badly formatted code from being committed"

**Status:** ⚠️ Planned for Phase 1 (Weeks 1-2 of modernization roadmap)

---

### 12. Deployment & Environments ✅ (EXCELLENT)

**Decision:**
- **Platform:** Google Cloud Run (serverless, auto-scaling)
- **CI/CD:** Cloud Build with separate dev/prod pipelines
- **Environments:**
  - Development (`develop` branch → lobbyist-registration-dev)
  - Production (`main` branch → lobbyist-registration, manual approval)

**Deployment Strategy:**
- Dev: Auto-deploy on push to `develop`
- Prod: Manual approval required, blue-green deployment, health checks

**What's Missing:**
- [ ] Secret Manager (using env vars currently)
- [ ] Feature flags system
- [ ] Database migrations in pipeline

**Golden Rule:**
> "All secrets in Secret Manager, all infrastructure as code"

**Status:** ✅ Deployment works well, ⚠️ Secret Manager needed (Phase 4 of modernization)

---

## 📊 Decision Status Summary

| Decision | Status | Phase to Address |
|----------|--------|------------------|
| 1. Database Layer | ✅ Excellent | Migration to PostgreSQL in Phase 3 |
| 2. API Layer | ⚠️ Needs Work | Add to Phase 1 or 2 |
| 3. UI Components | ✅ Excellent | None needed |
| 4. Data Fetching | ⚠️ Needs Work | Add to Phase 2 |
| 5. Auth & Permissions | ⚠️ Partial | Standardize helpers in Phase 2 |
| 6. Form Handling | ⚠️ Needs Work | Standardize in Phase 2 |
| 7. Testing Strategy | ⚠️ Partial | Phase 2 (Unit tests) |
| 8. TypeScript Strictness | ⚠️ Not Enforced | Phase 1 (Enable quality gates) |
| 9. File Structure | ✅ Excellent | None needed |
| 10. Error Handling | ❌ Missing | Phase 4 (Sentry) |
| 11. Code Formatting | ⚠️ In Progress | Phase 1 (Prettier + Husky) |
| 12. Deployment | ✅ Excellent | Phase 4 (Secret Manager) |

**Score: 4/12 Excellent, 6/12 Needs Work, 1/12 Missing, 1/12 In Progress**

---

## 🎯 How to Use This Document

### When Starting a New Feature

1. **Read relevant decisions** from this document
2. **Follow established patterns** (don't invent new approaches)
3. **Add to patterns** if you discover gaps (then update this doc)

### When Working with an LLM

**Good Prompt:**
> "Add an expense report form following our React Hook Form + Zod pattern from ARCHITECTURE-DECISIONS.md"

**Bad Prompt:**
> "Add an expense report form" (LLM will invent its own approach)

### When Reviewing Code

Check that code follows decisions in this document:
- [ ] Uses established patterns (no re-inventing)
- [ ] Follows golden rules
- [ ] Adds tests (if decision #7 requires it)
- [ ] Matches file structure (decision #9)

---

## 🔧 Recommended Additions

Based on our experience, here's what should be added to improve LLM coding efficiency:

### Priority 1: API Standardization
**Add to Phase 1 or 2 of modernization**

Create `lib/api-helpers.ts`:
```typescript
// Zod validation
export function validateRequest<T>(schema: z.Schema<T>, data: unknown): T

// Error handling
export function handleApiError(error: unknown): NextResponse

// Auth checking
export async function requireAuth(req: Request): Promise<User>
export async function requireRole(allowedRoles: UserRole[]): Promise<User>

// Standard response format
export function successResponse<T>(data: T, status = 200)
export function errorResponse(message: string, status = 400)
```

**Impact:** Every API will follow same pattern, 10x faster implementation

---

### Priority 2: Data Fetching Standardization
**Add to Phase 2 of modernization**

```bash
npm install @tanstack/react-query
```

Create query client wrapper, convert all `fetch()` to `useQuery()`

**Impact:** No more re-inventing loading/error/refetch logic

---

### Priority 3: Form Standardization
**Add to Phase 2 of modernization**

```bash
npm install react-hook-form @hookform/resolvers
```

Convert all forms to React Hook Form + Zod pattern

**Impact:** Consistent form handling, type-safe validation

---

### Priority 4: Error Handling
**Add to Phase 4 of modernization**

- Add React Error Boundaries
- Integrate Sentry
- Create standard error logging helper

**Impact:** No more silent failures, instant error visibility

---

## 📚 Related Documentation

- **CLAUDE.md** - Development guidelines and project context
- **MODERNIZATION-ROADMAP.md** - 8-week plan to address missing decisions
- **MODERNIZATION-QUICKSTART.md** - Quick reference for modernization work
- **PROJECT.md** - Complete project requirements

---

## 🎓 Lessons Learned

### What Worked
1. **Prisma decision** - Made upfront, followed strictly → smooth sailing
2. **shadcn/ui decision** - Clear component library → consistent UI
3. **File structure** - Simple, clear separation → easy to navigate
4. **Cloud Run deployment** - Serverless, auto-scaling → good for government

### What Didn't Work
1. **No API pattern** - Every endpoint felt different → slow, error-prone
2. **No data fetching pattern** - Repeated loading/error logic → messy
3. **No form pattern** - Different validation approaches → inconsistent
4. **No error handling pattern** - Errors handled differently → poor UX

### The Core Lesson

> **When working with LLMs, constraints = velocity**

The areas where we made opinionated architectural decisions upfront were the areas where development was fastest and most reliable.

The areas where we "stayed flexible" became the slowest and most error-prone.

**For future projects:**
- Make all 12 decisions before writing code
- Document golden rules clearly
- Enforce patterns through code review
- Update this doc when patterns evolve

---

## ✅ Next Steps

1. **Phase 1 (Weeks 1-2):** Enable code quality gates, add Prettier
2. **Phase 2 (Weeks 3-4):** Add unit tests, standardize APIs/forms/data fetching
3. **Phase 3 (Weeks 5-6):** Migrate to PostgreSQL, add GitHub Actions
4. **Phase 4 (Weeks 7-8):** Add Sentry, Secret Manager, security scanning

After 8 weeks, all 12 decisions will be fully implemented and enforced.

---

**Document Maintainer:** Development Team
**Review Frequency:** Update when new architectural decisions are made
**Last Major Update:** October 21, 2025 (Modernization roadmap created)
