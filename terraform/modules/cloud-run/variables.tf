# Cloud Run Module Variables

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run service"
  type        = string
  default     = "us-west1"
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "container_image" {
  description = "Container image to deploy (e.g., gcr.io/project/image:tag)"
  type        = string
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "cpu_limit" {
  description = "CPU limit (e.g., '1000m' for 1 vCPU)"
  type        = string
  default     = "1000m"
}

variable "memory_limit" {
  description = "Memory limit (e.g., '512Mi', '2Gi')"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = string
  default     = "0"
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = string
  default     = "10"
}

variable "container_concurrency" {
  description = "Maximum number of concurrent requests per container"
  type        = number
  default     = 80
}

variable "timeout_seconds" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

variable "env_vars" {
  description = "Environment variables"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "env_vars_from_secrets" {
  description = "Environment variables from Secret Manager"
  type = list(object({
    name        = string
    secret_name = string
    secret_key  = string
  }))
  default = []
}

variable "cloudsql_connections" {
  description = "Cloud SQL connection names (project:region:instance)"
  type        = list(string)
  default     = []
}

variable "health_check_path" {
  description = "Path for health check probes"
  type        = string
  default     = "/"
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access (public)"
  type        = bool
  default     = false
}

variable "authorized_members" {
  description = "List of IAM members authorized to invoke the service"
  type        = list(string)
  default     = []
}

variable "annotations" {
  description = "Additional annotations for the service"
  type        = map(string)
  default     = {}
}

variable "labels" {
  description = "Labels to apply to the service"
  type        = map(string)
  default = {
    application = "lobbyist-registration"
    managed_by  = "terraform"
  }
}
