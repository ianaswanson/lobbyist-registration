# Production Environment Infrastructure
# Lobbyist Registration System - Production Environment

terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # State backend configured in backend.tf
}

# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
  ])

  project = var.project_id
  service = each.value

  disable_on_destroy = false
}

# Cloud SQL PostgreSQL Instance
module "database" {
  source = "../../modules/cloud-sql"

  project_id    = var.project_id
  region        = var.region
  instance_name = var.database_instance_name

  # Production tier - slightly larger instance
  tier                = var.database_tier
  availability_type   = "ZONAL" # Can upgrade to REGIONAL for HA later
  disk_size           = 20
  deletion_protection = true # Protect production data

  # Database configuration
  database_name = var.database_name
  database_user = var.database_user

  # Backup configuration (production settings)
  backup_enabled                 = true
  backup_start_time              = "03:00"
  point_in_time_recovery_enabled = true
  retained_backups               = 7

  # Public IP required for Cloud Run connection
  ipv4_enabled = true
  require_ssl  = false

  # Allow connections from anywhere (Cloud Run uses dynamic IPs)
  authorized_networks = [
    {
      name  = "allow-all-cloudrun"
      value = "0.0.0.0/0"
    }
  ]

  labels = {
    environment = "production"
    application = "lobbyist-registration"
    managed_by  = "terraform"
  }

  depends_on = [
    google_project_service.required_apis
  ]
}

# Cloud Run Service
module "app" {
  source = "../../modules/cloud-run"

  project_id      = var.project_id
  region          = var.region
  service_name    = var.service_name
  container_image = var.container_image

  # Resource configuration
  cpu_limit    = "1000m"
  memory_limit = "512Mi"

  # Scaling configuration
  min_instances = "1" # Keep 1 instance warm in production
  max_instances = "10"

  # Environment variables
  env_vars = [
    {
      name  = "NODE_ENV"
      value = "production"
    },
    {
      name  = "NEXTAUTH_URL"
      value = "https://${var.service_name}-${var.project_number}.${var.region}.run.app"
    },
    {
      name  = "ENVIRONMENT"
      value = "production"
    }
  ]

  # Environment variables from secrets
  env_vars_from_secrets = [
    {
      name        = "DATABASE_URL"
      secret_name = module.database.database_url_secret_id
      secret_key  = "latest"
    },
    {
      name        = "NEXTAUTH_SECRET"
      secret_name = google_secret_manager_secret.nextauth_secret.secret_id
      secret_key  = "latest"
    }
  ]

  # Cloud SQL connection
  cloudsql_connections = [
    module.database.instance_connection_name
  ]

  # Public access for production
  allow_unauthenticated = true

  labels = {
    environment = "production"
    application = "lobbyist-registration"
    managed_by  = "terraform"
  }

  depends_on = [
    google_project_service.required_apis,
    module.database
  ]
}

# Generate NextAuth secret (only creates if doesn't exist)
resource "random_password" "nextauth_secret" {
  length  = 32
  special = false

  # Only generate once
  lifecycle {
    ignore_changes = [
      length,
      special,
    ]
  }
}

# Store NextAuth secret
resource "google_secret_manager_secret" "nextauth_secret" {
  secret_id = "${var.service_name}-nextauth-secret"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = "production"
    application = "lobbyist-registration"
    managed_by  = "terraform"
  }

  depends_on = [
    google_project_service.required_apis
  ]
}

resource "google_secret_manager_secret_version" "nextauth_secret" {
  secret      = google_secret_manager_secret.nextauth_secret.id
  secret_data = random_password.nextauth_secret.result

  lifecycle {
    ignore_changes = [
      secret_data,
    ]
  }
}
