# Production URL Reference

## Current Stable Production URL

```
https://lobbyist-registration-zzp44w3snq-uw.a.run.app
```

**This URL is stable and will NOT change between deployments.**

## Quick Links

### Application Pages
- **Home**: https://lobbyist-registration-zzp44w3snq-uw.a.run.app
- **Sign In**: https://lobbyist-registration-zzp44w3snq-uw.a.run.app/auth/signin
- **Public Dashboard**: https://lobbyist-registration-zzp44w3snq-uw.a.run.app/dashboard

### Documentation
- **Demo Guide**: https://lobbyist-registration-zzp44w3snq-uw.a.run.app/DEMO-GUIDE.html
- **Compliance Matrix**: https://lobbyist-registration-zzp44w3snq-uw.a.run.app/ORDINANCE-COMPLIANCE.html

## Share This URL

**For emails, presentations, and stakeholder communications:**

```
Multnomah County Lobbyist Registration System (Demo)
https://lobbyist-registration-zzp44w3snq-uw.a.run.app

Interactive Demo Guide:
https://lobbyist-registration-zzp44w3snq-uw.a.run.app/DEMO-GUIDE.html
```

## URL Stability

✅ **This URL is stable** - Share it confidently with stakeholders

### When does the URL change?
The URL only changes if you:
- Delete and recreate the service
- Rename the service (`lobbyist-registration`)
- Change regions (`us-west1`)

### Normal deployments do NOT change the URL
- Code updates ✅ Same URL
- Environment variable changes ✅ Same URL
- New revisions ✅ Same URL
- Container rebuilds ✅ Same URL

## Future: Custom Domain

For production launch, consider setting up a custom domain for better branding:

**Recommended domains:**
- `lobbyist.multco.us` (Multnomah County subdomain)
- `lobbyist-registration.multco.us`
- `transparency.multco.us`

**Benefits:**
- Professional appearance
- Easier to remember and share
- Government trust (.gov or county domain)
- Permanent URL that you control

**Setup Guide:** See [docs/CUSTOM-DOMAIN-SETUP.md](docs/CUSTOM-DOMAIN-SETUP.md)

## Verification

To verify the current production URL:
```bash
gcloud run services describe lobbyist-registration \
  --region=us-west1 \
  --format="value(status.url)"
```

## Test Credentials (Demo)

Use these credentials to demonstrate the system:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Board Member | board@example.com | password123 |
| Lobbyist | lobbyist@example.com | password123 |
| Employer | employer@example.com | password123 |

## Support

- **Technical Issues**: See troubleshooting in README.md
- **Access Requests**: Contact system administrator
- **Custom Domain Setup**: See docs/CUSTOM-DOMAIN-SETUP.md

---

**Last Updated**: October 16, 2025
**Service Status**: ✅ Active and Healthy
**Region**: us-west1 (Oregon)
