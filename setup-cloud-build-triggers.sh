#!/bin/bash

# Setup Cloud Build Triggers for Lobbyist Registration System
# This script configures automatic deployments from GitHub
#
# Prerequisites:
# 1. GitHub repository connected to Cloud Build (one-time setup in Console)
# 2. Cloud Build API enabled
# 3. Appropriate IAM permissions
#
# Usage:
#   ./setup-cloud-build-triggers.sh

set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REPO_OWNER="ianaswanson"
REPO_NAME="lobbyist-registration"
REGION="us-west1"

echo "================================================"
echo "Setting up Cloud Build Triggers"
echo "================================================"
echo "Project: $PROJECT_ID"
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Region: $REGION"
echo ""

# Check if Cloud Build API is enabled
echo "Checking Cloud Build API..."
if ! gcloud services list --enabled --filter="name:cloudbuild.googleapis.com" | grep -q cloudbuild; then
  echo "Enabling Cloud Build API..."
  gcloud services enable cloudbuild.googleapis.com
else
  echo "✅ Cloud Build API already enabled"
fi

# Create Cloud Storage bucket for build logs (if doesn't exist)
echo ""
echo "Setting up build logs bucket..."
BUCKET_NAME="${PROJECT_ID}_cloudbuild_logs"
if ! gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
  echo "Creating bucket: gs://$BUCKET_NAME"
  gsutil mb -l $REGION "gs://$BUCKET_NAME"
  echo "✅ Logs bucket created"
else
  echo "✅ Logs bucket already exists"
fi

# Grant Cloud Build service account permissions
echo ""
echo "Configuring Cloud Build service account permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${BUILD_SA}" \
  --role="roles/run.admin" \
  --condition=None \
  --no-user-output-enabled

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${BUILD_SA}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None \
  --no-user-output-enabled

echo "✅ Permissions configured"

# Create Development Trigger (Auto-deploy)
echo ""
echo "Creating DEVELOPMENT trigger (auto-deploy on 'develop' branch)..."

if gcloud builds triggers describe deploy-lobbyist-dev &>/dev/null; then
  echo "⚠️  Trigger 'deploy-lobbyist-dev' already exists. Updating..."
  gcloud builds triggers delete deploy-lobbyist-dev --quiet
fi

gcloud builds triggers create github \
  --name="deploy-lobbyist-dev" \
  --description="Auto-deploy to development environment on push to develop branch" \
  --repo-name="$REPO_NAME" \
  --repo-owner="$REPO_OWNER" \
  --branch-pattern="^develop$" \
  --build-config="cloudbuild-dev.yaml" \
  --substitutions="_REGION=$REGION" \
  --include-logs-with-status

echo "✅ Development trigger created"

# Create Production Trigger (Manual approval required)
echo ""
echo "Creating PRODUCTION trigger (manual approval on 'main' branch)..."

if gcloud builds triggers describe deploy-lobbyist-prod &>/dev/null; then
  echo "⚠️  Trigger 'deploy-lobbyist-prod' already exists. Updating..."
  gcloud builds triggers delete deploy-lobbyist-prod --quiet
fi

gcloud builds triggers create github \
  --name="deploy-lobbyist-prod" \
  --description="Deploy to production with manual approval on push to main branch" \
  --repo-name="$REPO_NAME" \
  --repo-owner="$REPO_OWNER" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-prod.yaml" \
  --require-approval \
  --substitutions="_REGION=$REGION" \
  --include-logs-with-status

echo "✅ Production trigger created (REQUIRES MANUAL APPROVAL)"

# Summary
echo ""
echo "================================================"
echo "✅ SETUP COMPLETE"
echo "================================================"
echo ""
echo "Triggers created:"
echo "  1. deploy-lobbyist-dev (auto-deploy on 'develop' branch)"
echo "  2. deploy-lobbyist-prod (manual approval on 'main' branch)"
echo ""
echo "Next steps:"
echo "  1. Test development deployment:"
echo "     git push origin develop"
echo ""
echo "  2. Watch build progress:"
echo "     https://console.cloud.google.com/cloud-build/builds"
echo ""
echo "  3. For production deployment:"
echo "     git push origin main"
echo "     Then approve in Cloud Build console"
echo ""
echo "  4. View trigger details:"
echo "     gcloud builds triggers list"
echo ""
echo "  5. View build logs:"
echo "     gcloud builds list --limit=10"
echo ""
echo "================================================"
echo ""
echo "IMPORTANT: First-time GitHub connection"
echo "================================================"
echo "If this is your first time using Cloud Build with GitHub:"
echo ""
echo "  1. Go to: https://console.cloud.google.com/cloud-build/triggers"
echo "  2. Click 'Connect Repository'"
echo "  3. Select 'GitHub (Cloud Build GitHub App)'"
echo "  4. Authenticate and select repository: $REPO_OWNER/$REPO_NAME"
echo "  5. Then re-run this script to create triggers"
echo ""
echo "================================================"
