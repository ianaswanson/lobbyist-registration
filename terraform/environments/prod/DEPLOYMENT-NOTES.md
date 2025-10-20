# Production Deployment Notes

## Current Situation

We have an existing production Cloud Run service that uses:
- **Database:** SQLite (embedded in container)
- **Deployment:** Manual gcloud command
- **URL:** https://lobbyist-registration-679888289147.us-west1.run.app

## Migration Strategy

We're migrating to Terraform-managed infrastructure with PostgreSQL, but doing it in **phases** to ensure zero downtime:

### Phase 1: Keep SQLite, Add Terraform Management (CURRENT APPROACH)

**Goal:** Get production under Terraform control without changing the database

**Steps:**
1. Build new container with runtime seeding (DONE ✓)
2. Deploy updated container to existing service using gcloud
3. Test that runtime seeding works with SQLite in production
4. THEN move to Terraform management

**Rationale:** This approach is safer because:
- We don't create a PostgreSQL database until we're ready
- We can test the runtime seeding in production with SQLite first
- We update the existing service in-place (no downtime)
- We can roll back easily if needed

### Phase 2: Terraform Management (Future)

Once Phase 1 is validated, we can:
1. Create production Terraform config (DONE ✓)
2. Import existing resources into Terraform state
3. Plan and apply Terraform changes
4. Migrate from SQLite to PostgreSQL if desired

## Current Production Configuration

```yaml
Service: lobbyist-registration
Region: us-west1
Container: Manual deployment
Environment:
  - NODE_ENV: production
  - NEXTAUTH_SECRET: (from Secret Manager)
Resources:
  - CPU: 1 vCPU
  - Memory: 512Mi
Scaling:
  - Max instances: 3
```

## Phase 1 Deployment Command

Deploy the new container with runtime seeding to production:

```bash
gcloud run deploy lobbyist-registration \
  --image us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration:latest \
  --region us-west1 \
  --project lobbyist-475218 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets=NEXTAUTH_SECRET=nextauth-secret:latest \
  --set-env-vars NODE_ENV=production \
  --cpu 1 \
  --memory 512Mi \
  --max-instances 3 \
  --no-traffic
```

**Note:** The `--no-traffic` flag deploys a new revision without sending traffic to it, allowing us to test first.

## Testing After Deployment

1. Get the new revision URL:
   ```bash
   gcloud run revisions list --service lobbyist-registration --region us-west1 --project lobbyist-475218
   ```

2. Test the new revision:
   ```bash
   curl https://[NEW_REVISION_URL]/api/health
   ```

3. Check logs for successful seeding:
   ```bash
   gcloud run logs read --service lobbyist-registration --region us-west1 --project lobbyist-475218 --limit 50
   ```

4. If tests pass, send 100% traffic to new revision:
   ```bash
   gcloud run services update-traffic lobbyist-registration \
     --to-revisions [NEW_REVISION]=100 \
     --region us-west1 \
     --project lobbyist-475218
   ```

## Rollback Plan

If something goes wrong, roll back to the previous revision:

```bash
gcloud run services update-traffic lobbyist-registration \
  --to-revisions [PREVIOUS_REVISION]=100 \
  --region us-west1 \
  --project lobbyist-475218
```

## Future: Full Terraform Migration

When ready to move to full Terraform management with PostgreSQL:

1. Run the Terraform configuration in `terraform/environments/prod/`
2. This will create:
   - Cloud SQL PostgreSQL instance
   - Service account with proper permissions
   - Secret Manager secrets for database credentials
   - Update the Cloud Run service to use PostgreSQL

3. The migration will be handled by Terraform's state management
4. Database migration will happen automatically via runtime seeding

## Success Criteria

- ✓ Production container built with runtime seeding
- ⏳ New revision deployed and tested
- ⏳ Traffic migrated to new revision
- ⏳ Login works immediately (admin@multnomah.gov / admin123)
- ⏳ No manual database seeding required
- ⏳ Logs show successful automatic seeding

## Next Steps After Phase 1

Once Phase 1 is validated in production:
1. Document the production deployment process
2. Create monitoring and alerting
3. Plan Phase 2 (PostgreSQL migration)
4. Set up CI/CD for automatic deployments
