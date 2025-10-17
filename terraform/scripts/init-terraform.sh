#!/bin/bash
# Initialize Terraform and create GCS backend bucket
# Run this script once before using Terraform

set -e

PROJECT_ID="lobbyist-475218"
BUCKET_NAME="lobbyist-terraform-state"
REGION="us-west1"

echo "🚀 Initializing Terraform infrastructure..."
echo ""

# Check if gcloud is configured
if ! gcloud config get-value project >/dev/null 2>&1; then
    echo "❌ gcloud is not configured. Run: gcloud init"
    exit 1
fi

# Set project
echo "📦 Setting GCP project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required GCP APIs..."
gcloud services enable \
    storage-api.googleapis.com \
    storage.googleapis.com \
    cloudresourcemanager.googleapis.com \
    --project=$PROJECT_ID

# Create GCS bucket for Terraform state
echo "🪣 Creating GCS bucket for Terraform state: $BUCKET_NAME"
if gsutil ls -b gs://$BUCKET_NAME >/dev/null 2>&1; then
    echo "✅ Bucket already exists: gs://$BUCKET_NAME"
else
    gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME
    echo "✅ Created bucket: gs://$BUCKET_NAME"
fi

# Enable versioning on the bucket
echo "📚 Enabling versioning on state bucket..."
gsutil versioning set on gs://$BUCKET_NAME
echo "✅ Versioning enabled"

# Set lifecycle policy to delete old versions after 30 days
echo "🗑️  Setting lifecycle policy for old versions..."
cat > /tmp/lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 10,
          "isLive": false
        }
      }
    ]
  }
}
EOF
gsutil lifecycle set /tmp/lifecycle.json gs://$BUCKET_NAME
rm /tmp/lifecycle.json
echo "✅ Lifecycle policy set (keep 10 versions)"

# Set bucket permissions (uniform bucket-level access)
echo "🔒 Setting bucket permissions..."
gsutil uniformbucketlevelaccess set on gs://$BUCKET_NAME
echo "✅ Uniform bucket-level access enabled"

# Create terraform.tfvars.example if it doesn't exist
echo "📝 Creating example tfvars files..."
for env in dev prod; do
    if [ ! -f "../environments/$env/terraform.tfvars.example" ]; then
        cat > "../environments/$env/terraform.tfvars.example" <<EOF
# Terraform Variables - $env environment
# Copy this file to terraform.tfvars and customize

project_id     = "lobbyist-475218"
project_number = "679888289147"
region         = "us-west1"

# Container image (update after building)
container_image = "gcr.io/lobbyist-475218/lobbyist-registration-$env:latest"
EOF
        echo "✅ Created environments/$env/terraform.tfvars.example"
    fi
done

echo ""
echo "✅ Terraform initialization complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Navigate to dev environment:"
echo "   cd terraform/environments/dev"
echo ""
echo "2. Copy example variables (if not done):"
echo "   cp terraform.tfvars.example terraform.tfvars"
echo ""
echo "3. Initialize Terraform:"
echo "   terraform init"
echo ""
echo "4. Review the plan:"
echo "   terraform plan"
echo ""
echo "5. Apply the configuration:"
echo "   terraform apply"
echo ""
