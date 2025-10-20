# Production Environment Variables

variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "lobbyist-475218"
}

variable "project_number" {
  description = "GCP project number (for Cloud Run URL)"
  type        = string
  default     = "679888289147"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-west1"
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
  default     = "lobbyist-registration"
}

variable "database_instance_name" {
  description = "Name of the Cloud SQL instance"
  type        = string
  default     = "lobbyist-db-prod"
}

variable "database_tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-g1-small" # Slightly larger than dev
}

variable "database_name" {
  description = "Name of the database"
  type        = string
  default     = "lobbyist_registry"
}

variable "database_user" {
  description = "Database user name"
  type        = string
  default     = "lobbyist_app"
}

variable "container_image" {
  description = "Container image for Cloud Run"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder, will be updated
}
