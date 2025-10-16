# Secret Rotation Process

## Overview
This document describes the process for rotating authentication secrets for the Lobbyist Registration System. For government applications, regular secret rotation is a security best practice.

**Recommended Rotation Schedule:** Every 90 days

## Production Secret Rotation

### Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated
- Access to the `lobbyist-475218` GCP project
- Permission to manage secrets (roles/secretmanager.admin)

### Step-by-Step Process

#### 1. Generate New Secret
```bash
# Generate a cryptographically secure random secret
openssl rand -base64 32
```

**Example output:** `XyZ123abc...` (32 base64 characters)

#### 2. Create New Secret Version in Google Secret Manager
```bash
# Store the new secret in Google Secret Manager
echo -n "PASTE_YOUR_NEW_SECRET_HERE" | \
  gcloud secrets versions add nextauth-secret \
  --data-file=-
```

**Note:** The `-n` flag in `echo` is important - it prevents adding a newline character.

#### 3. Verify New Secret Version
```bash
# List all versions of the secret
gcloud secrets versions list nextauth-secret

# The newest version should be marked as "ENABLED"
```

#### 4. Update Cloud Run Service (Optional)
Cloud Run automatically uses the `latest` version, but you can pin to a specific version:

```bash
# Check current configuration
gcloud run services describe lobbyist-registration \
  --region=us-west1 \
  --format="value(spec.template.spec.containers[0].env)"

# If needed, update to use specific version (e.g., version 2)
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --set-secrets=AUTH_SECRET=nextauth-secret:2
```

**Recommended:** Use `latest` to always get the newest version automatically.

#### 5. Test Production Application
```bash
# Verify the application works with the new secret
curl -I https://lobbyist-registration-679888289147.us-west1.run.app

# Should return: HTTP/2 200 or 302 (redirect to sign-in)
```

#### 6. Monitor for Issues
```bash
# Check logs for authentication errors
gcloud run services logs read lobbyist-registration \
  --region=us-west1 \
  --limit=50 \
  | grep -i "auth\|error"
```

#### 7. Disable Old Secret Version (After Confirmation)
```bash
# Wait 24-48 hours to ensure no issues
# Then disable the old version (don't delete for audit trail)
gcloud secrets versions disable VERSION_NUMBER \
  --secret=nextauth-secret

# Example: disable version 1
gcloud secrets versions disable 1 --secret=nextauth-secret
```

### Rollback Procedure

If issues occur after rotation:

```bash
# Re-enable the previous version
gcloud secrets versions enable OLD_VERSION_NUMBER \
  --secret=nextauth-secret

# Update Cloud Run to use the old version
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --set-secrets=AUTH_SECRET=nextauth-secret:OLD_VERSION_NUMBER

# Check logs
gcloud run services logs read lobbyist-registration \
  --region=us-west1 \
  --limit=20
```

## Development Secret Rotation

Development secrets are stored in `.env` locally and should be rotated when:
- A developer leaves the project
- The `.env` file is accidentally exposed
- As part of quarterly rotation (align with production)

### Process

1. **Generate new secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update `.env` file:**
   ```bash
   # Edit .env and replace AUTH_SECRET value
   nano .env
   ```

3. **Restart dev server:**
   ```bash
   # Kill existing dev servers
   lsof -ti:3000 | xargs kill -9

   # Start fresh
   npm run dev
   ```

4. **Clear browser cookies:**
   - Open browser dev tools (F12)
   - Application → Cookies → Clear all for localhost:3000

5. **Test sign-in:**
   - Navigate to http://localhost:3000
   - Sign in with test credentials
   - Verify authentication works

## Rotation Schedule Tracking

### Production Rotation Log

| Date | Rotated By | Secret Version | Reason | Issues |
|------|------------|----------------|--------|--------|
| 2025-10-15 | Ian Swanson | v1 (initial) | Initial deployment | None |
| YYYY-MM-DD | | | | |

**Next Rotation Due:** 2026-01-15 (90 days from initial deployment)

### Setting Up Rotation Reminders

**Option 1: Calendar Reminder**
- Add recurring calendar event every 90 days
- Title: "Rotate Lobbyist Registration AUTH_SECRET"
- Include link to this document

**Option 2: Google Cloud Monitoring Alert**
Create a secret age alert:

```bash
# This requires setting up Cloud Monitoring
# Documentation: https://cloud.google.com/secret-manager/docs/monitor-secrets
```

## Security Best Practices

1. **Never commit secrets to git**
   - `.env` is in `.gitignore`
   - Always use `.env.example` for templates

2. **Never share secrets via:**
   - Email
   - Slack/messaging
   - Screenshots
   - Documentation

3. **Use Google Secret Manager for:**
   - All production secrets
   - Any shared environments (staging, QA)

4. **Use local `.env` for:**
   - Individual developer environments only
   - Temporary testing

5. **Audit access regularly:**
   ```bash
   # Check who has access to secrets
   gcloud secrets get-iam-policy nextauth-secret
   ```

6. **Document all rotations:**
   - Update the rotation log above
   - Note any issues encountered
   - Track version numbers

## Troubleshooting

### Issue: "UntrustedHost" error after rotation
**Cause:** NextAuth configuration issue
**Fix:** Ensure `trustHost: true` in `lib/auth.ts`

### Issue: All users logged out after rotation
**Expected behavior:** New secret invalidates all existing sessions
**Action:** Users must sign in again (this is normal and secure)

### Issue: "Invalid authentication" errors
**Cause:** Secret not properly set or corrupted
**Fix:**
1. Verify secret value: `gcloud secrets versions access latest --secret=nextauth-secret`
2. Check for extra whitespace/newlines
3. Regenerate and re-add if needed

### Issue: Cloud Run not picking up new secret
**Cause:** Cloud Run uses cached secret values
**Fix:** Force new deployment:
```bash
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --update-annotations=rotate-secret=$(date +%s)
```

## Compliance Notes

This rotation process helps meet:
- **NIST SP 800-53 IA-5(1):** Password-based authentication requirements
- **SOC 2 CC6.1:** Logical and physical access controls
- **FedRAMP:** Secret rotation requirements for government systems

Regular secret rotation reduces the window of exposure if a secret is compromised.

## References

- [Google Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [NextAuth.js Security Documentation](https://next-auth.js.org/configuration/options#secret)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
