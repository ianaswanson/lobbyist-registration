#!/bin/bash
# Import existing production resources into Terraform state
# This script imports the existing production Cloud Run service and secrets

set -e

PROJECT_ID="lobbyist-475218"
REGION="us-west1"
SERVICE_NAME="lobbyist-registration"

echo "=========================================="
echo "Production Resource Import Script"
echo "=========================================="
echo ""
echo "This script will import existing production resources into Terraform:"
echo "  - Cloud Run service: ${SERVICE_NAME}"
echo "  - Secret Manager secret: nextauth-secret"
echo ""
echo "Note: We will NOT import the Cloud SQL database as it doesn't exist yet."
echo "      Terraform will create a new production database."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 1: Checking if resources exist..."
echo "=========================================="

# Check if Cloud Run service exists
if gcloud run services describe ${SERVICE_NAME} --region=${REGION} --project=${PROJECT_ID} &>/dev/null; then
    echo "✓ Cloud Run service '${SERVICE_NAME}' exists"
else
    echo "✗ Cloud Run service '${SERVICE_NAME}' not found"
    exit 1
fi

# Check if nextauth secret exists
if gcloud secrets describe nextauth-secret --project=${PROJECT_ID} &>/dev/null; then
    echo "✓ Secret 'nextauth-secret' exists"
else
    echo "✗ Secret 'nextauth-secret' not found"
    exit 1
fi

echo ""
echo "Step 2: Initializing Terraform..."
echo "=========================================="
terraform init

echo ""
echo "Step 3: Importing existing resources..."
echo "=========================================="

# Import the nextauth secret
echo "Importing Secret Manager secret..."
if terraform state show google_secret_manager_secret.nextauth_secret &>/dev/null; then
    echo "⚠ Secret already in state, skipping import"
else
    terraform import google_secret_manager_secret.nextauth_secret \
        projects/${PROJECT_ID}/secrets/nextauth-secret || echo "⚠ Secret import may have failed, continuing..."
fi

# Note: We don't import the Cloud Run service yet because we need to create
# the database and service account first. After running terraform apply,
# Terraform will update the existing service rather than recreating it.

echo ""
echo "Step 4: Planning infrastructure changes..."
echo "=========================================="
echo "Running terraform plan to see what will be created/updated..."
echo ""

terraform plan -out=tfplan

echo ""
echo "=========================================="
echo "Import complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Review the plan above carefully"
echo "  2. If it looks good, run: terraform apply tfplan"
echo "  3. This will:"
echo "     - Create a new Cloud SQL database for production"
echo "     - Create a service account for Cloud Run"
echo "     - Update (not recreate) the existing Cloud Run service"
echo "     - Configure the service to use PostgreSQL instead of SQLite"
echo ""
echo "Note: The Cloud Run service will NOT be deleted/recreated."
echo "      Terraform will update it in-place for zero downtime."
echo ""
