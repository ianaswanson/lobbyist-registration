#!/bin/bash

# Deployment Script for Lobbyist Registration System
# This script automates the deployment to Google Cloud Run

set -e  # Exit on error

echo "🚀 Lobbyist Registration - Deployment Script"
echo "=============================================="
echo ""

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: PROJECT_ID environment variable not set"
    echo ""
    echo "Please set it with:"
    echo "  export PROJECT_ID=your-project-id"
    echo ""
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"
echo ""

# Set region
REGION="us-west1"
SERVICE_NAME="lobbyist-registration"

echo "🔍 Step 1: Checking prerequisites..."
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud CLI not found. Please install it first."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ git not found. Please install it first."; exit 1; }
echo "✅ Prerequisites OK"
echo ""

echo "🏗️  Step 2: Building container..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
echo "✅ Build complete"
echo ""

echo "🔐 Step 3: Checking for NextAuth secret..."
if ! gcloud secrets describe nextauth-secret >/dev/null 2>&1; then
    echo "⚠️  NextAuth secret not found. Creating one..."
    SECRET=$(openssl rand -base64 32)
    echo -n "$SECRET" | gcloud secrets create nextauth-secret --data-file=-

    # Grant Cloud Run access
    gcloud secrets add-iam-policy-binding nextauth-secret \
      --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"

    echo "✅ Secret created"
else
    echo "✅ Secret exists"
fi
echo ""

echo "🚀 Step 4: Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,DATABASE_URL="file:./prisma/prod.db" \
  --set-secrets NEXTAUTH_SECRET=nextauth-secret:latest \
  --min-instances 0 \
  --max-instances 3 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300

echo ""
echo "✅ Deployment complete!"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo "🌐 Your application is live at:"
echo "   $SERVICE_URL"
echo ""

echo "📝 Next steps:"
echo "1. Update NEXTAUTH_URL with the service URL:"
echo "   gcloud run services update $SERVICE_NAME \\"
echo "     --region $REGION \\"
echo "     --set-env-vars NEXTAUTH_URL=\"$SERVICE_URL\""
echo ""
echo "2. Test login with seed data:"
echo "   Email: admin@multnomah.gov"
echo "   Password: admin123"
echo ""
echo "3. View logs:"
echo "   gcloud run services logs tail $SERVICE_NAME --region $REGION"
echo ""
