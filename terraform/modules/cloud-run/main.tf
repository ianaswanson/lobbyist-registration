# Cloud Run Module
# Deploys a containerized Next.js application to Cloud Run

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Service account for Cloud Run service
resource "google_service_account" "cloudrun" {
  account_id   = "${var.service_name}-sa"
  display_name = "Cloud Run service account for ${var.service_name}"
  project      = var.project_id
}

# Grant Cloud SQL client role to service account
resource "google_project_iam_member" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Grant Secret Manager accessor role to service account
resource "google_project_iam_member" "secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Cloud Run service
resource "google_cloud_run_service" "app" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.cloudrun.email

      # Container configuration
      containers {
        image = var.container_image

        # Resource limits
        resources {
          limits = {
            cpu    = var.cpu_limit
            memory = var.memory_limit
          }
        }

        # Environment variables
        dynamic "env" {
          for_each = var.env_vars
          content {
            name  = env.value.name
            value = env.value.value
          }
        }

        # Environment variables from secrets
        dynamic "env" {
          for_each = var.env_vars_from_secrets
          content {
            name = env.value.name
            value_from {
              secret_key_ref {
                name = env.value.secret_name
                key  = env.value.secret_key
              }
            }
          }
        }

        # Ports
        ports {
          name           = "http1"
          container_port = var.container_port
        }

        # Startup probe (increased timeout for cold starts)
        startup_probe {
          http_get {
            path = var.health_check_path
            port = var.container_port
          }
          initial_delay_seconds = 10
          timeout_seconds       = 3
          period_seconds        = 10
          failure_threshold     = 3
        }

        # Liveness probe
        liveness_probe {
          http_get {
            path = var.health_check_path
            port = var.container_port
          }
          initial_delay_seconds = 0
          timeout_seconds       = 1
          period_seconds        = 10
          failure_threshold     = 3
        }
      }

      # Container concurrency
      container_concurrency = var.container_concurrency

      # Timeout
      timeout_seconds = var.timeout_seconds
    }

    metadata {
      annotations = merge(
        {
          "autoscaling.knative.dev/minScale" = var.min_instances
          "autoscaling.knative.dev/maxScale" = var.max_instances
          "run.googleapis.com/cloudsql-instances" = length(var.cloudsql_connections) > 0 ? join(",", var.cloudsql_connections) : null
        },
        var.annotations
      )

      labels = var.labels
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # Auto-generate revision names
  autogenerate_revision_name = true

  lifecycle {
    ignore_changes = [
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
    ]
  }
}

# IAM policy for public access (if enabled)
resource "google_cloud_run_service_iam_member" "public_access" {
  count    = var.allow_unauthenticated ? 1 : 0
  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# IAM policy for specific members (if provided)
resource "google_cloud_run_service_iam_member" "authorized_members" {
  for_each = toset(var.authorized_members)
  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = each.value
}
