# Terraform State Backend Configuration
# Stores state in Google Cloud Storage with versioning and locking

terraform {
  backend "gcs" {
    bucket = "lobbyist-terraform-state"
    prefix = "env/dev"
  }
}

# Note: The GCS bucket will be created by the init script
# Run: ./scripts/init-terraform.sh
