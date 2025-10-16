# Developer Setup Guide

## Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Git**: Latest version
- **Google Cloud SDK** (for production deployments only)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ianaswanson/lobbyist-registration.git
cd lobbyist-registration
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

**IMPORTANT:** Never commit `.env` files to git. Always use the template.

```bash
# Copy the example environment file
cp .env.example .env

# Generate a secure AUTH_SECRET
openssl rand -base64 32

# Edit .env and paste the generated secret
nano .env
# Replace: AUTH_SECRET="REPLACE_WITH_OUTPUT_FROM_openssl_rand_-base64_32"
# With: AUTH_SECRET="<paste the output from openssl rand -base64 32>"
```

Your `.env` should look like:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<32-character random base64 string>"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with test data
npm run db:seed
```

**Test accounts created by seed:**
- **Admin:** admin@example.com / password123
- **Board Member:** board@example.com / password123
- **Lobbyist:** lobbyist@example.com / password123
- **Employer:** employer@example.com / password123

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:3000

### 6. View Database (Optional)

```bash
# Open Prisma Studio to view/edit database
npx prisma studio
```

Available at: http://localhost:5555

## Development Workflow

### Common Commands

```bash
# Start dev server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run linter
npm run lint

# Reset and reseed database
rm prisma/dev.db
npx prisma migrate dev
npm run db:seed

# View database in Prisma Studio
npx prisma studio
```

### Working with Database Schema

**GOLDEN RULE: Always use migrations for schema changes**

```bash
# 1. Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name descriptive_name

# 3. Migration is created in prisma/migrations/

# 4. Commit the migration file
git add prisma/migrations/
git commit -m "Add migration: descriptive_name"
```

**Never:**
- Manually modify the database
- Skip migrations
- Edit existing migration files

### Using Beads for Task Management

This project uses **Beads** (`bd`) for issue tracking:

```bash
# List all issues
bd list

# Show issues ready to work on (no blockers)
bd ready

# Create new issue
bd create "Issue title" --labels feature,mvp

# Show issue details
bd show <id>

# Start working on an issue
bd update <id> --status in-progress

# Complete an issue
bd close <id>

# Mark issue as blocked
bd dep add <blocker-id> <blocked-id>
```

**Common labels:**
- `mvp` - Phase 1 features
- `phase2` - Post-launch features
- `bug` - Defects
- `feature` - New functionality
- `ui` - Frontend work
- `backend` - API work
- `accessibility` - WCAG compliance

## Testing Locally

### Manual Testing

1. **Sign in as different user roles:**
   - Admin: Can issue violations, view compliance dashboard
   - Board Member: Can post calendars
   - Lobbyist: Can register, file expense reports
   - Employer: Can file employer expense reports

2. **Test key workflows:**
   - Lobbyist registration
   - Quarterly expense reporting
   - Violation issuance (admin)
   - Appeal filing
   - Public transparency dashboard

### Database Testing

```bash
# Reset database to clean state
rm prisma/dev.db
npx prisma migrate dev
npm run db:seed

# View data in Prisma Studio
npx prisma studio
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Issues

```bash
# Reset database completely
rm prisma/dev.db prisma/dev.db-journal
npx prisma migrate dev
npm run db:seed
```

### Authentication Not Working

1. **Check AUTH_SECRET:**
   ```bash
   # Verify it's set in .env
   cat .env | grep AUTH_SECRET
   ```

2. **Regenerate if needed:**
   ```bash
   openssl rand -base64 32
   # Update .env with new secret
   ```

3. **Clear browser cookies:**
   - Open DevTools (F12)
   - Application → Cookies → Delete all for localhost:3000

4. **Restart dev server:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   npm run dev
   ```

### NextAuth "UntrustedHost" Error

This should only happen in production. Ensure `trustHost: true` is set in `lib/auth.ts`.

### Prisma Client Not Found

```bash
# Regenerate Prisma client
npx prisma generate
```

### Migration Conflicts

```bash
# If migrations are out of sync:
# 1. Backup your data if needed
# 2. Reset database
rm prisma/dev.db
npx prisma migrate dev

# This will replay all migrations
```

## Project Structure

```
/
├── app/                          # Next.js 15 App Router
│   ├── (authenticated)/          # Protected routes
│   │   ├── admin/               # Admin dashboard
│   │   │   └── violations/      # Violation tracking
│   │   ├── board-member/        # Board member features
│   │   ├── lobbyist/            # Lobbyist features
│   │   └── employer/            # Employer features
│   ├── api/                     # API routes
│   │   ├── auth/                # NextAuth endpoints
│   │   ├── violations/          # Violation CRUD
│   │   └── appeals/             # Appeal CRUD
│   └── auth/                    # Auth pages (sign-in)
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   └── forms/                   # Form components
├── lib/                         # Utilities
│   ├── auth.ts                  # NextAuth configuration
│   └── db.ts                    # Prisma client
├── prisma/                      # Database
│   ├── schema.prisma            # Schema (source of truth)
│   ├── migrations/              # Version-controlled migrations
│   └── seed.ts                  # Test data
├── docs/                        # Documentation
├── wireframes/                  # Interactive wireframes
├── .env.example                 # Environment template
├── .env                         # Local environment (gitignored)
└── CLAUDE.md                    # Development guide
```

## Getting Help

### Documentation
- **Project Overview:** `PROJECT.md`
- **Development Guide:** `CLAUDE.md`
- **Secret Management:** `docs/SECRET-ROTATION-PROCESS.md`
- **Ordinance:** `Government_Accountably_Ordinance_4.2.25_-_CA_Approved.pdf`

### Wireframes
Open `wireframes/index.html` to view interactive designs for:
- Lobbyist registration
- Quarterly expense reporting
- Admin compliance dashboard
- Public search interface

### User Story Map
Open `user-story-map.html` to see the complete feature map and priorities.

## Security Reminders

1. **Never commit `.env` files**
2. **Always use `.env.example` as template**
3. **Generate strong secrets:** `openssl rand -base64 32`
4. **Never share secrets via Slack/email**
5. **Use Google Secret Manager for production**

## Contributing

1. **Check for existing issues:** `bd list`
2. **Pick an issue:** `bd ready`
3. **Mark as in-progress:** `bd update <id> --status in-progress`
4. **Make changes** (follow code style)
5. **Test thoroughly** (manual testing for now)
6. **Commit with clear messages**
7. **Close issue:** `bd close <id>`

## Production Deployment

See `DEPLOYMENT-PLAN.md` for complete production deployment instructions.

**Quick reference:**
```bash
# Authenticate
gcloud auth login

# Deploy
gcloud run deploy lobbyist-registration \
  --source . \
  --region=us-west1 \
  --allow-unauthenticated
```

**Production URL:** https://lobbyist-registration-679888289147.us-west1.run.app

## Next Steps

1. ✅ Complete initial setup above
2. ✅ Sign in at http://localhost:3000
3. ✅ Explore the app with different user roles
4. ✅ Review wireframes and user story map
5. ✅ Pick an issue and start contributing! (`bd ready`)

Welcome to the project! 🎉
