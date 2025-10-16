# Custom Domain Setup for Cloud Run

## Overview

Currently, your application uses the Cloud Run default URL:
**https://lobbyist-registration-zzp44w3snq-uw.a.run.app**

For production use, you should set up a **custom domain** like:
- `lobbyist.multco.us` (if you have access to county domain)
- `lobbyist-registration.your-domain.com` (your own domain)

## Benefits of Custom Domain

1. **Professional appearance** - Government agencies expect `.gov` or county domains
2. **URL stability** - Domain never changes, even if you recreate the service
3. **Branding** - Matches Multnomah County's web presence
4. **Trust** - Users trust official government domains
5. **SEO** - Better search engine ranking

## Option 1: Use Multnomah County Domain (Recommended)

If you have access to `multco.us` or `multco.gov` DNS:

### Step 1: Choose Subdomain
Examples:
- `lobbyist.multco.us`
- `lobbyist-registration.multco.us`
- `transparency.multco.us`

### Step 2: Map Domain in Cloud Run

```bash
# Add domain mapping
gcloud run domain-mappings create \
  --service=lobbyist-registration \
  --domain=lobbyist.multco.us \
  --region=us-west1
```

### Step 3: Get DNS Records

```bash
# Get the DNS records to add
gcloud run domain-mappings describe \
  --domain=lobbyist.multco.us \
  --region=us-west1
```

This will output something like:
```
CNAME: ghs.googlehosted.com
A: 216.239.32.21
A: 216.239.34.21
A: 216.239.36.21
A: 216.239.38.21
```

### Step 4: Update County DNS

Contact Multnomah County IT/DNS administrator and provide:
- **Subdomain**: `lobbyist.multco.us`
- **Record Type**: CNAME
- **Value**: `ghs.googlehosted.com`

Or use A records:
- **Record Type**: A
- **Values**: (the IP addresses from step 3)

### Step 5: Verify Domain

```bash
# Check domain mapping status
gcloud run domain-mappings describe \
  --domain=lobbyist.multco.us \
  --region=us-west1
```

Wait 10-60 minutes for DNS propagation. Then test:
```bash
curl -I https://lobbyist.multco.us
```

### Step 6: Update NextAuth Configuration

Update `.env` (local) and Cloud Run env vars:

```bash
# Update Cloud Run environment variable
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --update-env-vars NEXTAUTH_URL=https://lobbyist.multco.us
```

### Step 7: Update Documentation

Update these files with new URL:
- `README.md`
- `DEMO-GUIDE.html`
- `ORDINANCE-COMPLIANCE.html`
- Any other references to the old URL

## Option 2: Use Your Own Domain

If you have your own domain (e.g., `your-domain.com`):

### Step 1: Verify Domain Ownership

```bash
# Start domain verification
gcloud domains verify your-domain.com
```

Follow the instructions to add a TXT record to your DNS.

### Step 2: Map Domain

```bash
gcloud run domain-mappings create \
  --service=lobbyist-registration \
  --domain=lobbyist.your-domain.com \
  --region=us-west1
```

### Step 3: Update DNS

Add DNS records at your domain registrar (GoDaddy, Namecheap, etc.):

**CNAME Record:**
- **Host**: `lobbyist`
- **Points to**: `ghs.googlehosted.com`
- **TTL**: 3600

### Step 4: Enable HTTPS

Cloud Run automatically provisions SSL certificates via Let's Encrypt. This takes 15-60 minutes after DNS propagation.

### Step 5: Update Environment Variables

```bash
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --update-env-vars NEXTAUTH_URL=https://lobbyist.your-domain.com
```

## Option 3: Free Alternative - Firebase Hosting

If you don't have access to a custom domain, you can use Firebase Hosting as a free proxy:

### Benefits:
- Free SSL certificate
- Free custom domain support
- Better URL: `your-project.web.app` or custom domain

### Setup:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

Then configure Firebase Hosting to proxy to your Cloud Run URL.

## Current URL Reference

**Current Stable URL**: https://lobbyist-registration-zzp44w3snq-uw.a.run.app

This URL is stable and won't change unless you:
- Delete and recreate the service
- Change the service name
- Change regions

## Verification Checklist

After setting up custom domain:

- [ ] DNS records added
- [ ] Domain mapping shows "Active" status
- [ ] SSL certificate provisioned (HTTPS works)
- [ ] `NEXTAUTH_URL` updated in Cloud Run
- [ ] Test authentication (sign in/out)
- [ ] Test all routes work with new domain
- [ ] Update all documentation with new URL
- [ ] Notify stakeholders of URL change
- [ ] Set up redirect from old URL (optional)

## Troubleshooting

### SSL Certificate Not Provisioning

**Issue**: HTTPS shows certificate errors
**Fix**: Wait up to 60 minutes. Check DNS propagation:
```bash
dig lobbyist.multco.us
nslookup lobbyist.multco.us
```

### Authentication Errors After Domain Change

**Issue**: "Invalid redirect" or "Callback URL mismatch"
**Fix**: Ensure `NEXTAUTH_URL` is updated:
```bash
gcloud run services describe lobbyist-registration \
  --region=us-west1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### Domain Shows "Not Verified"

**Issue**: Domain mapping status is "Pending"
**Fix**: Complete domain verification:
```bash
gcloud domains verify your-domain.com
```

## Cost

**Custom domain on Cloud Run**: **FREE**
- No additional cost for domain mapping
- SSL certificates included (Let's Encrypt)
- Only pay for Cloud Run usage (already paying)

## Recommended Next Steps

1. **Contact Multnomah County IT** to request subdomain
2. **Choose subdomain name** (get stakeholder approval)
3. **Follow Option 1 steps** above
4. **Update all documentation** with new URL
5. **Test thoroughly** before announcing

## Contact

For assistance with custom domain setup:
- **Cloud Run Documentation**: https://cloud.google.com/run/docs/mapping-custom-domains
- **DNS Setup**: Contact your DNS administrator
- **SSL Issues**: Cloud Run support automatically handles SSL

---

**Note**: For government applications, using an official `.gov` or county domain (`.us`) significantly increases user trust and compliance with government web standards.
