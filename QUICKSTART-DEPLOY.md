# Quick Start - Deploy to Google Cloud (5 Minutes)

This is the **fastest path** to get your app running in production. For detailed explanations, see `DEPLOYMENT-PLAN.md`.

---

## Prerequisites (One-Time Setup)

### 1. Install Required Software

```bash
# Check what you already have:
node --version    # Need 18+
git --version     # Should already be installed
gcloud --version  # Need to install this
```

**If you need gcloud CLI:**
```bash
# macOS - Run this in terminal:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Then authenticate:
gcloud auth login
```

### 2. Create Google Cloud Project

```bash
# Go to: https://console.cloud.google.com/projectcreate
# Project name: lobbyist-registration
# Click "Create"
# Copy your PROJECT_ID (shown after creation)

# Set as default:
gcloud config set project YOUR_PROJECT_ID

# Enable required services (takes 2 min):
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
```

### 3. Push Code to GitHub

```bash
# Create repo on GitHub: https://github.com/new
# Name: lobbyist-registration-multnomah

cd /Users/ianswanson/ai-dev/lobbyist-registration

# Initialize git (if needed):
git init
git add .
git commit -m "Initial commit"

# Link to GitHub (replace YOUR_USERNAME):
git remote add origin https://github.com/YOUR_USERNAME/lobbyist-registration-multnomah.git
git branch -M main
git push -u origin main
```

---

## Deploy (2 Commands)

### Option A: Automated Script (Recommended)

```bash
# Set your project ID:
export PROJECT_ID="your-project-id"

# Run deployment script:
./deploy.sh
```

Done! The script will output your live URL.

---

### Option B: Manual Commands

```bash
# Set project ID:
export PROJECT_ID="your-project-id"

# Build container (~5 min first time):
gcloud builds submit --tag gcr.io/$PROJECT_ID/lobbyist-registration

# Create secret:
SECRET=$(openssl rand -base64 32)
echo -n "$SECRET" | gcloud secrets create nextauth-secret --data-file=-

# Grant access to secret:
gcloud secrets add-iam-policy-binding nextauth-secret \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Deploy to Cloud Run:
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

After deployment, you'll see your URL like:
```
https://lobbyist-registration-xxxxx-uw.a.run.app
```

---

## Update NEXTAUTH_URL (One More Step)

```bash
# Copy your URL from above, then run:
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --set-env-vars NEXTAUTH_URL="https://your-actual-url.run.app"
```

---

## Test It

1. **Open the URL in your browser**

2. **Login with seed data:**
   - Email: `admin@multnomah.gov`
   - Password: `admin123`

3. **Try other accounts:**
   - Lobbyist: `john.doe@lobbying.com` / `lobbyist123`
   - Board Member: `commissioner@multnomah.gov` / `board123`

4. **View logs (if needed):**
   ```bash
   gcloud run services logs tail lobbyist-registration --region us-west1
   ```

---

## Redeploy After Changes

```bash
# 1. Commit your changes:
git add .
git commit -m "Updated features"
git push origin main

# 2. Redeploy:
export PROJECT_ID="your-project-id"
./deploy.sh
```

---

## Cost

**Demo/testing usage: FREE**
- Stays within Google Cloud free tier
- No charges for light usage
- Database reseeds on each deployment

**If you see charges:**
- Should be $0-2/month for light testing
- Can delete anytime with: `gcloud run services delete lobbyist-registration --region us-west1`

---

## Troubleshooting

### Build fails
```bash
# Check build logs:
gcloud builds list --limit 5
gcloud builds log [BUILD_ID]
```

### Service won't start
```bash
# View detailed logs:
gcloud run services logs read lobbyist-registration --region us-west1 --limit 50
```

### Login doesn't work
- Make sure you updated NEXTAUTH_URL with your actual Cloud Run URL
- Check secret is set: `gcloud secrets describe nextauth-secret`

---

## You're Done!

Your app is now running "for real" in production on Google Cloud. Share the URL with your boss and run your demo!

For the interactive demo guide, open `DEMO-GUIDE.html` in your browser.
