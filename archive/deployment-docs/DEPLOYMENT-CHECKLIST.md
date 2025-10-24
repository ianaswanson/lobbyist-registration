# Deployment Checklist

Use this checklist to track your deployment progress. Check off items as you complete them.

---

## Phase 1: Prerequisites (One-Time Setup)

### Software Installation
- [ ] **Node.js 18+** installed
  ```bash
  node --version
  # Should show v18.x or v20.x
  ```

- [ ] **Git** installed
  ```bash
  git --version
  # Should show git version 2.x
  ```

- [ ] **Google Cloud CLI** installed
  ```bash
  gcloud --version
  # Install: curl https://sdk.cloud.google.com | bash
  ```

- [ ] **Authenticated with gcloud**
  ```bash
  gcloud auth login
  # Opens browser for Google login
  ```

---

## Phase 2: Google Cloud Setup

### Project Creation
- [ ] **Created Google Cloud Project**
  - Visit: https://console.cloud.google.com/projectcreate
  - Project name: `lobbyist-registration`
  - Note your PROJECT_ID: `_______________________`

- [ ] **Set default project**
  ```bash
  gcloud config set project YOUR_PROJECT_ID
  ```

- [ ] **Enabled required APIs**
  ```bash
  gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
  # Takes ~2 minutes
  ```

### Billing Setup (Required for Free Tier)
- [ ] **Added billing account**
  - Visit: https://console.cloud.google.com/billing
  - Link a billing account (credit card required for verification)
  - ⚠️ Note: You won't be charged for free tier usage

- [ ] **Set up budget alerts** (Recommended)
  - Visit: https://console.cloud.google.com/billing/budgets
  - Set alerts at: $5, $10, $20

---

## Phase 3: Code Repository

### GitHub Setup
- [ ] **Created GitHub repository**
  - Visit: https://github.com/new
  - Name: `lobbyist-registration-multnomah`
  - Privacy: Private (recommended)
  - Don't initialize with README

- [ ] **Initialized Git locally**
  ```bash
  cd /Users/ianswanson/ai-dev/lobbyist-registration
  git init
  ```

- [ ] **Committed all files**
  ```bash
  git add .
  git commit -m "Initial commit - Multnomah County Lobbyist Registration"
  ```

- [ ] **Linked to GitHub**
  ```bash
  # Replace YOUR_USERNAME with your GitHub username
  git remote add origin https://github.com/YOUR_USERNAME/lobbyist-registration-multnomah.git
  ```

- [ ] **Pushed to GitHub**
  ```bash
  git branch -M main
  git push -u origin main
  ```

---

## Phase 4: Environment Configuration

### Local Verification
- [ ] **Verified local app still works**
  ```bash
  npm install
  npm run dev
  # Visit http://localhost:3000
  ```

- [ ] **All deployment files present**
  - [ ] `Dockerfile`
  - [ ] `.dockerignore`
  - [ ] `next.config.ts` (updated with `output: 'standalone'`)
  - [ ] `.env.production.example`
  - [ ] `cloudrun.yaml`
  - [ ] `deploy.sh` (executable)
  - [ ] `DEPLOYMENT-PLAN.md`
  - [ ] `QUICKSTART-DEPLOY.md`

---

## Phase 5: Deployment

### Build and Deploy
- [ ] **Set PROJECT_ID environment variable**
  ```bash
  export PROJECT_ID="your-project-id-here"
  echo $PROJECT_ID  # Verify it's set correctly
  ```

- [ ] **Option A: Run automated script**
  ```bash
  ./deploy.sh
  # This does all the steps below automatically
  ```

  **OR Option B: Manual steps:**

- [ ] **Built container image**
  ```bash
  gcloud builds submit --tag gcr.io/$PROJECT_ID/lobbyist-registration
  # Takes ~5-8 minutes first time
  ```

- [ ] **Created NextAuth secret**
  ```bash
  SECRET=$(openssl rand -base64 32)
  echo -n "$SECRET" | gcloud secrets create nextauth-secret --data-file=-
  ```

- [ ] **Granted secret access**
  ```bash
  gcloud secrets add-iam-policy-binding nextauth-secret \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
  ```

- [ ] **Deployed to Cloud Run**
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
    --cpu 1 \
    --timeout 300
  ```

- [ ] **Copied service URL**
  - URL: `_______________________________________`

- [ ] **Updated NEXTAUTH_URL**
  ```bash
  gcloud run services update lobbyist-registration \
    --region us-west1 \
    --set-env-vars NEXTAUTH_URL="https://your-actual-url.run.app"
  ```

---

## Phase 6: Verification

### Testing
- [ ] **Visited deployed URL in browser**
  - URL: https://your-app.run.app

- [ ] **Homepage loads correctly**
  - [ ] Public search page visible
  - [ ] No error messages
  - [ ] Styling looks correct

- [ ] **Tested login with seed data**
  - [ ] Admin: `admin@multnomah.gov` / `admin123` ✓
  - [ ] Lobbyist: `john.doe@lobbying.com` / `lobbyist123` ✓
  - [ ] Board Member: `commissioner@multnomah.gov` / `board123` ✓

- [ ] **Verified key functionality**
  - [ ] Admin dashboard loads
  - [ ] Lobbyist profile displays data
  - [ ] Public search returns results
  - [ ] Forms are accessible

- [ ] **Checked logs for errors**
  ```bash
  gcloud run services logs tail lobbyist-registration --region us-west1
  # Look for any ERROR or WARNING messages
  ```

---

## Phase 7: Documentation

### Demo Preparation
- [ ] **Opened DEMO-GUIDE.html**
  - Located at: `/Users/ianswanson/ai-dev/lobbyist-registration/DEMO-GUIDE.html`
  - Updated any URLs to point to production (if needed)

- [ ] **Tested demo flow**
  - [ ] Public persona (5 min)
  - [ ] Lobbyist persona (5 min)
  - [ ] Employer persona (3 min)
  - [ ] Board Member persona (5 min)
  - [ ] Admin persona (5 min)

- [ ] **Downloaded sample files**
  - [ ] Board member ICS template
  - [ ] All CSV templates
  - Located in `/public/` folder

- [ ] **Reviewed ORDINANCE-COMPLIANCE.html**
  - Be ready to discuss compliance status with stakeholders

---

## Phase 8: Ongoing Maintenance

### Monitoring
- [ ] **Set up monitoring dashboard**
  - Visit: https://console.cloud.google.com/run
  - View metrics: requests, latency, errors

- [ ] **Subscribed to budget alerts**
  - Confirmed email notifications working

### Update Process
- [ ] **Know how to redeploy**
  ```bash
  git add .
  git commit -m "Changes"
  git push origin main
  export PROJECT_ID="your-project-id"
  ./deploy.sh
  ```

- [ ] **Know how to view logs**
  ```bash
  gcloud run services logs tail lobbyist-registration --region us-west1
  ```

- [ ] **Know how to delete service** (to stop all charges)
  ```bash
  gcloud run services delete lobbyist-registration --region us-west1
  ```

---

## Troubleshooting Reference

If something goes wrong:

### Build Failures
```bash
# View build history
gcloud builds list --limit 5

# View specific build log
gcloud builds log [BUILD_ID]
```

### Deployment Failures
```bash
# View service details
gcloud run services describe lobbyist-registration --region us-west1

# View recent logs
gcloud run services logs read lobbyist-registration --region us-west1 --limit 50
```

### Authentication Issues
- Verify NEXTAUTH_URL matches your Cloud Run URL exactly
- Check secret exists: `gcloud secrets describe nextauth-secret`
- Regenerate secret if needed (see DEPLOYMENT-PLAN.md)

### Database Issues
- Remember: SQLite resets on each deployment (expected for demo)
- Seed data loads automatically on startup
- Check logs for "Seed data loaded successfully"

---

## Success Criteria

You've successfully deployed when:
- ✅ App accessible via public HTTPS URL
- ✅ Login works with seed credentials
- ✅ All user personas can access their pages
- ✅ No critical errors in logs
- ✅ Staying within free tier budget

---

## Next Steps After Successful Deployment

1. **Share with stakeholders**
   - Send production URL
   - Provide DEMO-GUIDE.html
   - Share ORDINANCE-COMPLIANCE.html

2. **Gather feedback**
   - Test with real users
   - Document issues/requests
   - Prioritize Phase 2 features

3. **Plan for production** (if moving forward)
   - Consider Cloud SQL for persistent data
   - Set up custom domain
   - Configure email service (SendGrid, Mailgun)
   - Add SSL certificate (automatic with Cloud Run)
   - Implement proper backup strategy

---

## Support Resources

- **Deployment Plan**: `DEPLOYMENT-PLAN.md` (detailed explanations)
- **Quick Start**: `QUICKSTART-DEPLOY.md` (fast path)
- **Demo Guide**: `DEMO-GUIDE.html` (presentation walkthrough)
- **Compliance Matrix**: `ORDINANCE-COMPLIANCE.html` (legal requirements)
- **Google Cloud Console**: https://console.cloud.google.com/
- **Cloud Run Documentation**: https://cloud.google.com/run/docs
