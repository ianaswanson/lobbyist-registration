# Cloud Run Module Outputs

output "service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_service.app.name
}

output "service_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_service.app.status[0].url
}

output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.cloudrun.email
}

output "service_id" {
  description = "Fully qualified service ID"
  value       = google_cloud_run_service.app.id
}

output "latest_created_revision" {
  description = "Latest created revision name"
  value       = google_cloud_run_service.app.status[0].latest_created_revision_name
}

output "latest_ready_revision" {
  description = "Latest ready revision name"
  value       = google_cloud_run_service.app.status[0].latest_ready_revision_name
}
