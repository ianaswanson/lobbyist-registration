# Terraform State Backend Configuration
# Stores state in Google Cloud Storage with versioning and locking

terraform {
  backend "gcs" {
    bucket = "lobbyist-terraform-state"
    prefix = "env/prod"
  }
}

# Note: The GCS bucket was created during dev environment setup
