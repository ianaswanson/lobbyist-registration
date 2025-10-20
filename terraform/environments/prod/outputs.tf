# Production Environment Outputs

output "service_url" {
  description = "URL of the Cloud Run service"
  value       = module.app.service_url
}

output "service_name" {
  description = "Name of the Cloud Run service"
  value       = module.app.service_name
}

output "database_instance_name" {
  description = "Name of the Cloud SQL instance"
  value       = module.database.instance_name
}

output "database_connection_name" {
  description = "Cloud SQL connection name for Cloud Run"
  value       = module.database.instance_connection_name
}

output "database_name" {
  description = "Name of the database"
  value       = module.database.database_name
}

output "database_user" {
  description = "Database user name"
  value       = module.database.database_user
}

output "database_password_secret" {
  description = "Secret Manager secret for database password"
  value       = module.database.database_password_secret_id
  sensitive   = true
}

output "database_url_secret" {
  description = "Secret Manager secret for DATABASE_URL"
  value       = module.database.database_url_secret_id
  sensitive   = true
}

output "nextauth_secret_id" {
  description = "Secret Manager secret for NextAuth"
  value       = google_secret_manager_secret.nextauth_secret.secret_id
  sensitive   = true
}

output "service_account_email" {
  description = "Service account email for Cloud Run"
  value       = module.app.service_account_email
}

# Instructions for next steps
output "next_steps" {
  description = "Instructions for deploying updates"
  value = <<-EOT

    ✅ Production infrastructure deployed successfully!

    Production URLs:
      Primary: https://${var.service_name}-${var.project_number}.${var.region}.run.app
      Legacy:  https://${var.service_name}-zzp44w3snq-uw.a.run.app

    To deploy application updates:

    1. Build and push production container image:
       cd ../..  # Back to project root
       docker build -t us-west1-docker.pkg.dev/${var.project_id}/lobbyist-registry/${var.service_name}:latest .
       docker push us-west1-docker.pkg.dev/${var.project_id}/lobbyist-registry/${var.service_name}:latest

    2. Update Terraform with the new image:
       cd terraform/environments/prod
       terraform apply -var="container_image=us-west1-docker.pkg.dev/${var.project_id}/lobbyist-registry/${var.service_name}:latest"

    3. Verify deployment:
       curl ${module.app.service_url}/api/health

    4. Database seeds automatically on startup (runtime seeding enabled)

    📊 Production database details:
       Instance: ${module.database.instance_name}
       Connection: ${module.database.instance_connection_name}
       Database: ${module.database.database_name}
       User: ${module.database.database_user}

    🔒 Security notes:
       - Deletion protection: ENABLED
       - Point-in-time recovery: ENABLED
       - Backups retained: 7 days
       - Min instances: 1 (no cold starts)
  EOT
}
