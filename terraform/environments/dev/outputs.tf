# Development Environment Outputs

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
  description = "Instructions for deploying the application"
  value = <<-EOT

    ✅ Infrastructure deployed successfully!

    Next steps:

    1. Build and push your container image:
       cd ../..  # Back to project root
       gcloud builds submit --tag gcr.io/${var.project_id}/${var.service_name}

    2. Update Terraform with the new image:
       cd terraform/environments/dev
       terraform apply -var="container_image=gcr.io/${var.project_id}/${var.service_name}:latest"

    3. Run database migrations:
       # Get DATABASE_URL from Secret Manager
       gcloud secrets versions access latest --secret="${module.database.database_url_secret_id}"

       # Set it locally and run migrations
       export DATABASE_URL="..."
       npx prisma migrate deploy

    4. Seed the database:
       curl -X POST ${module.app.service_url}/api/admin/seed

    5. Access your dev application:
       ${module.app.service_url}

    📊 Database connection details:
       Instance: ${module.database.instance_name}
       Connection: ${module.database.instance_connection_name}
       Database: ${module.database.database_name}
       User: ${module.database.database_user}
       Password: (stored in Secret Manager: ${module.database.database_password_secret_id})
  EOT
}
