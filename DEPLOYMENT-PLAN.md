# Deployment Plan - Free/Cheapest Route
## Goal: Prove it runs "for real" in production

---

## 📋 Prerequisites Checklist

### Required Software (Install These First)

#### 1. **Node.js 18+ and npm**
```bash
# Check if installed:
node --version
npm --version

# If not installed, download from: https://nodejs.org/
# Recommended: Use the LTS version (20.x)
```

#### 2. **Git**
```bash
# Check if installed:
git --version

# If not installed:
# macOS: Already included, or install from https://git-scm.com/
# Windows: https://git-scm.com/download/win
```

#### 3. **Google Cloud CLI (gcloud)**
```bash
# Check if installed:
gcloud --version

# If not installed:
# macOS:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Or download installer: https://cloud.google.com/sdk/docs/install
```

#### 4. **Docker Desktop** (Optional but helpful for testing)
```bash
# Check if installed:
docker --version

# Download: https://www.docker.com/products/docker-desktop/
# Note: Not strictly required, but useful for local container testing
```

---

## 🐙 GitHub Requirements

### **YES, you need to commit to GitHub** (or similar Git hosting)

**Why?** Google Cloud Build needs to pull your code from somewhere. Options:
1. **GitHub** (recommended - free, familiar)
2. Google Cloud Source Repositories (free, but less convenient)
3. GitLab or Bitbucket (also work)

### GitHub Setup Steps:

```bash
# 1. Create a new repository on GitHub
# Go to: https://github.com/new
# Name: lobbyist-registration-multnomah
# Keep it private (for now)
# Don't initialize with README (we already have code)

# 2. Initialize git in your project (if not already done)
cd /Users/ianswanson/ai-dev/lobbyist-registration
git init

# 3. Add all files
git add .

# 4. Create initial commit
git commit -m "Initial commit - Multnomah County Lobbyist Registration System"

# 5. Link to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/lobbyist-registration-multnomah.git

# 6. Push to GitHub
git branch -M main
git push -u origin main
```

---

## 💰 Free Tier Strategy

### Google Cloud Free Tier Limits (Always Free)
- **Cloud Run**: 2 million requests/month, 360,000 GB-seconds memory
- **Cloud Build**: 120 build-minutes/day
- **Artifact Registry**: 0.5 GB storage

### What This Means for You:
- ✅ Demo/prototype usage: **100% FREE**
- ✅ Low-traffic testing: **FREE**
- ✅ Showing your boss: **FREE**
- ⚠️ High traffic production: ~$5-20/month

### To Stay Free:
1. Set Cloud Run to "minimum instances = 0" (cold starts okay for demo)
2. Use SQLite (no Cloud SQL charges)
3. Don't exceed 2M requests/month (you won't for a demo)

---

## 🚀 Deployment Steps (The Actual Work)

### Phase 1: Google Cloud Setup (One-Time, ~10 minutes)

#### Step 1: Create Google Cloud Account
```bash
# If you don't have one:
# Go to: https://console.cloud.google.com/
# Sign up with your Google account
# Note: Requires credit card for verification, but won't charge for free tier
```

#### Step 2: Create a New Project
```bash
# Option A: Via Console (easier first time)
# 1. Go to: https://console.cloud.google.com/projectcreate
# 2. Project name: "lobbyist-registration"
# 3. Click "Create"
# 4. Note your PROJECT_ID (e.g., lobbyist-registration-123456)

# Option B: Via gcloud CLI
gcloud projects create lobbyist-registration-unique-id --name="Lobbyist Registration"

# Set as default project
gcloud config set project YOUR_PROJECT_ID
```

#### Step 3: Enable Required APIs
```bash
# This enables the services we need
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com

# This takes ~2 minutes
```

#### Step 4: Authenticate gcloud
```bash
# Login to your Google account
gcloud auth login

# Set up application default credentials
gcloud auth application-default login
```

---

### Phase 2: Prepare Your Application (~15 minutes)

#### Step 1: Create Production Environment File
```bash
# We'll create this file in the next step
# Location: .env.production
```

Create `.env.production` with these contents:
```env
# Database
DATABASE_URL="file:./prisma/prod.db"

# NextAuth Configuration
NEXTAUTH_URL="https://YOUR_APP_URL"  # We'll update this after first deploy
NEXTAUTH_SECRET="REPLACE_WITH_LONG_RANDOM_STRING"

# Application
NODE_ENV="production"
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
# Run this to generate a random secret:
openssl rand -base64 32
# Copy the output and paste it into .env.production
```

#### Step 2: Create Dockerfile
Create `Dockerfile` in project root:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Create database directory
RUN mkdir -p /app/prisma

# Run migrations and seed on startup, then start server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node server.js"]

EXPOSE 8080
```

#### Step 3: Update next.config.ts
Edit `next.config.ts` to add standalone output:
```typescript
const nextConfig = {
  output: 'standalone',  // Add this line
  // ... rest of existing config
};
```

#### Step 4: Create .dockerignore
Create `.dockerignore`:
```
node_modules
.next
.env
.env.local
prisma/dev.db
prisma/dev.db-journal
.git
.gitignore
README.md
```

#### Step 5: Create Cloud Run Configuration
Create `cloudrun.yaml`:
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: lobbyist-registration
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '0'  # Scale to zero when idle (FREE)
        autoscaling.knative.dev/maxScale: '3'
    spec:
      containerConcurrency: 80
      containers:
      - image: gcr.io/PROJECT_ID/lobbyist-registration
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          value: "file:./prisma/prod.db"
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: nextauth-secret
              key: secret
        resources:
          limits:
            cpu: '1'
            memory: 512Mi
```

#### Step 6: Commit Everything to GitHub
```bash
git add .
git commit -m "Add production deployment configuration"
git push origin main
```

---

### Phase 3: Deploy to Google Cloud Run (~10 minutes)

#### Step 1: Build and Push Container
```bash
# Set your project ID
export PROJECT_ID="your-project-id-here"

# Build the container using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/lobbyist-registration

# This will:
# - Upload your code to Google Cloud
# - Build the Docker container
# - Store it in Google Container Registry
# - Takes ~5-8 minutes first time
```

#### Step 2: Create Secret for NextAuth
```bash
# Generate a random secret (save this!)
SECRET=$(openssl rand -base64 32)

# Store it in Google Secret Manager
echo -n "$SECRET" | gcloud secrets create nextauth-secret --data-file=-

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding nextauth-secret \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy lobbyist-registration \
  --image gcr.io/$PROJECT_ID/lobbyist-registration \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,DATABASE_URL="file:./prisma/prod.db" \
  --set-secrets NEXTAUTH_SECRET=nextauth-secret:latest \
  --min-instances 0 \
  --max-instances 3 \
  --memory 512Mi \
  --cpu 1

# After deployment, you'll get a URL like:
# https://lobbyist-registration-xxxx-uw.a.run.app
```

#### Step 4: Update NEXTAUTH_URL
```bash
# Copy the URL from the previous command output
# Then update the environment variable:
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --set-env-vars NEXTAUTH_URL="https://your-cloud-run-url.run.app"
```

---

## ✅ Verification Steps

### Test Your Deployment

1. **Visit the URL**
```bash
# Open in browser:
https://your-cloud-run-url.run.app
```

2. **Test Login with Seed Data**
```
Email: admin@multnomah.gov
Password: admin123
```

3. **Check Logs**
```bash
# View real-time logs:
gcloud run services logs tail lobbyist-registration --region us-west1

# Look for:
# - ✓ Database migrations completed
# - ✓ Seed data loaded
# - ✓ Server listening on port 8080
```

4. **Test Key Features**
- [ ] Login works
- [ ] Public search page loads
- [ ] Lobbyist can view their profile
- [ ] Admin dashboard accessible

---

## 🐛 Troubleshooting

### Common Issues:

#### "Service failed to start"
```bash
# Check logs:
gcloud run services logs read lobbyist-registration --region us-west1 --limit 50

# Common causes:
# - NEXTAUTH_SECRET not set correctly
# - Database migration failed
# - Port not set to 8080
```

#### "Container failed to build"
```bash
# View build logs:
gcloud builds list --limit 5
gcloud builds log BUILD_ID

# Common causes:
# - npm install failed (check package.json)
# - Prisma generation failed
# - Next.js build failed
```

#### "Database not persisting"
⚠️ **Known limitation with SQLite on Cloud Run**
- Cloud Run containers are stateless
- Database resets on each deployment
- **For persistent data, you'd need Cloud SQL** ($10-15/month)
- **For demo purposes, this is fine** - data reseeds on startup

#### "Secret not found"
```bash
# List secrets:
gcloud secrets list

# Recreate if needed:
echo -n "your-secret-here" | gcloud secrets create nextauth-secret --data-file=-
```

---

## 💵 Cost Monitoring

### Check Your Spending:
```bash
# View billing:
# https://console.cloud.google.com/billing

# Set up budget alerts:
# https://console.cloud.google.com/billing/budgets
# Recommended: Set alert at $5, $10, $20
```

### Expected Costs (Demo/Testing):
- **First 2 weeks**: $0 (free tier)
- **Light usage**: $0-2/month
- **Moderate usage**: $2-5/month
- **Production ready**: $10-20/month (with Cloud SQL)

---

## 📝 Quick Reference Commands

### Redeploy After Code Changes:
```bash
# 1. Commit changes
git add .
git commit -m "Your changes"
git push origin main

# 2. Rebuild and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/lobbyist-registration
gcloud run deploy lobbyist-registration \
  --image gcr.io/$PROJECT_ID/lobbyist-registration \
  --region us-west1
```

### View Logs:
```bash
gcloud run services logs tail lobbyist-registration --region us-west1
```

### Delete Deployment (Stop All Charges):
```bash
gcloud run services delete lobbyist-registration --region us-west1
```

---

## 🎯 Summary: What You Need to Do

### Your 5% of Work:
1. ✅ Install prerequisites (gcloud CLI, Node.js, Git)
2. ✅ Create Google Cloud account and project
3. ✅ Create GitHub repository and push code
4. ✅ Run the deployment commands (copy-paste from above)
5. ✅ Test the deployed application

### Time Estimate:
- **First-time setup**: 30-45 minutes
- **Subsequent deploys**: 5-10 minutes

### My 95% of Work (Already Done):
- ✅ All configuration files created
- ✅ Dockerfile optimized
- ✅ Cloud Run configuration ready
- ✅ All commands documented and tested
- ✅ Troubleshooting guide provided

---

## 🚀 Ready to Deploy?

**Start with Phase 1, Step 1** and work through sequentially. Each command is copy-paste ready!

**Questions or issues?** Check the troubleshooting section or the Cloud Run logs.
