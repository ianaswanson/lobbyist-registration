# Cloud SQL Module Variables

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for the Cloud SQL instance"
  type        = string
  default     = "us-west1"
}

variable "instance_name" {
  description = "Name of the Cloud SQL instance"
  type        = string
}

variable "database_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "POSTGRES_15"
}

variable "tier" {
  description = "Machine tier for Cloud SQL instance"
  type        = string
  default     = "db-f1-micro"

  validation {
    condition     = can(regex("^db-", var.tier))
    error_message = "Tier must start with 'db-'"
  }
}

variable "availability_type" {
  description = "Availability type (ZONAL or REGIONAL)"
  type        = string
  default     = "ZONAL"

  validation {
    condition     = contains(["ZONAL", "REGIONAL"], var.availability_type)
    error_message = "Availability type must be ZONAL or REGIONAL"
  }
}

variable "disk_type" {
  description = "Disk type (PD_SSD or PD_HDD)"
  type        = string
  default     = "PD_SSD"
}

variable "disk_size" {
  description = "Disk size in GB"
  type        = number
  default     = 10
}

variable "disk_autoresize" {
  description = "Enable automatic disk size increase"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
  default     = "lobbyist_registry"
}

variable "database_user" {
  description = "Database user name"
  type        = string
  default     = "lobbyist_app"
}

variable "backup_enabled" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_start_time" {
  description = "Backup start time (HH:MM format, UTC)"
  type        = string
  default     = "03:00" # 3 AM UTC = 7 PM PST (off-hours)
}

variable "point_in_time_recovery_enabled" {
  description = "Enable point-in-time recovery"
  type        = bool
  default     = false # Enable for production
}

variable "transaction_log_retention_days" {
  description = "Transaction log retention days for PITR"
  type        = number
  default     = 7
}

variable "retained_backups" {
  description = "Number of backups to retain"
  type        = number
  default     = 7
}

variable "ipv4_enabled" {
  description = "Enable public IP (required for Cloud Run connection without VPC)"
  type        = bool
  default     = true
}

variable "private_network" {
  description = "VPC network for private IP (optional)"
  type        = string
  default     = null
}

variable "require_ssl" {
  description = "Require SSL for connections"
  type        = bool
  default     = false # Cloud Run uses Unix socket, SSL not needed
}

variable "authorized_networks" {
  description = "List of authorized networks for Cloud SQL access"
  type = list(object({
    name  = string
    value = string
  }))
  default = [
    {
      name  = "all"
      value = "0.0.0.0/0"
    }
  ]
}

variable "maintenance_window_day" {
  description = "Day of week for maintenance (1 = Monday)"
  type        = number
  default     = 7 # Sunday
}

variable "maintenance_window_hour" {
  description = "Hour of day for maintenance (0-23, UTC)"
  type        = number
  default     = 3 # 3 AM UTC = 7 PM PST
}

variable "maintenance_window_update_track" {
  description = "Update track for maintenance (stable or canary)"
  type        = string
  default     = "stable"
}

variable "database_flags" {
  description = "Database flags for PostgreSQL configuration"
  type = list(object({
    name  = string
    value = string
  }))
  default = [
    {
      name  = "log_checkpoints"
      value = "on"
    },
    {
      name  = "log_connections"
      value = "on"
    },
    {
      name  = "log_disconnections"
      value = "on"
    },
    {
      name  = "log_lock_waits"
      value = "on"
    },
    {
      name  = "max_connections"
      value = "100"
    }
  ]
}

variable "query_insights_enabled" {
  description = "Enable query insights"
  type        = bool
  default     = true
}

variable "query_string_length" {
  description = "Maximum query string length to store"
  type        = number
  default     = 1024
}

variable "record_application_tags" {
  description = "Record application tags in query insights"
  type        = bool
  default     = true
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    application = "lobbyist-registration"
    managed_by  = "terraform"
  }
}
