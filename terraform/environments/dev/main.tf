# Development Environment Infrastructure
# Lobbyist Registration System - Dev Environment

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

  # Development tier - smallest instance
  tier                = var.database_tier
  availability_type   = "ZONAL"
  disk_size           = 10
  deletion_protection = false # Allow deletion in dev

  # Database configuration
  database_name = var.database_name
  database_user = var.database_user

  # Backup configuration (lighter for dev)
  backup_enabled                 = true
  backup_start_time              = "03:00"
  point_in_time_recovery_enabled = false
  retained_backups               = 3

  # Public IP required for Cloud Run connection
  ipv4_enabled = true
  require_ssl  = false

  # Allow connections from anywhere (dev only)
  authorized_networks = [
    {
      name  = "allow-all-dev"
      value = "0.0.0.0/0"
    }
  ]

  labels = {
    environment = "dev"
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

  project_id     = var.project_id
  region         = var.region
  service_name   = var.service_name
  container_image = var.container_image

  # Resource configuration
  cpu_limit    = "1000m"
  memory_limit = "512Mi"

  # Scaling configuration
  min_instances = "0" # Scale to zero in dev to save costs
  max_instances = "3"

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
      value = "dev"
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

  # Public access for dev
  allow_unauthenticated = true

  labels = {
    environment = "dev"
    application = "lobbyist-registration"
    managed_by  = "terraform"
  }

  depends_on = [
    google_project_service.required_apis,
    module.database
  ]
}

# Generate NextAuth secret
resource "random_password" "nextauth_secret" {
  length  = 32
  special = false
}

# Store NextAuth secret
resource "google_secret_manager_secret" "nextauth_secret" {
  secret_id = "${var.service_name}-nextauth-secret"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = "dev"
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
}
