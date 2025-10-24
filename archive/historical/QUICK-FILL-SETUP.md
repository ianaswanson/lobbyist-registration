# Quick Fill Extension - Custom Data Setup

## Overview

The Quick Fill Chrome extension can automatically detect and use domain-specific test data for your application. This allows for faster testing and more realistic demos by providing application-specific values like policy areas, Portland restaurants, expense amounts, and coordinated lobbyist personas.

**IMPORTANT:** This works on **both localhost AND deployed environments**. The extension fetches data from the current domain, so:
- On `http://localhost:3000` → fetches `http://localhost:3000/.well-known/quick-fill-data.json`
- On `https://staging.example.com` → fetches `https://staging.example.com/.well-known/quick-fill-data.json`
- On `https://production.example.com` → fetches `https://production.example.com/.well-known/quick-fill-data.json`

## Setup Instructions

### 1. Ensure the `.well-known` Directory is Served

The custom data file needs to be accessible at:
```
https://yourdomain.com/.well-known/quick-fill-data.json
```

**For Next.js:**
- The `.well-known` directory is already in the project root
- Next.js should automatically serve static files from the root
- Verify by visiting `http://localhost:3000/.well-known/quick-fill-data.json`

**If the file is not accessible:**

Option A: Move to `public` directory (recommended for Next.js):
```bash
mkdir -p public/.well-known
cp .well-known/quick-fill-data.json public/.well-known/
```

Option B: Configure `next.config.js` to serve the `.well-known` directory:
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/.well-known/:path*',
        destination: '/.well-known/:path*',
      },
    ]
  },
}
```

Option C: Add to `vercel.json` (if deploying to Vercel):
```json
{
  "routes": [
    {
      "src": "/.well-known/(.*)",
      "dest": "/.well-known/$1"
    }
  ]
}
```

### 2. Verify the File is Accessible

**Local Development:**
1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/.well-known/quick-fill-data.json`
3. You should see the JSON data (not a 404)

**Deployed Environment:**
1. Deploy your app
2. Visit: `https://yourdomain.com/.well-known/quick-fill-data.json`
3. Verify the JSON data is returned

### 3. Test the Extension

1. **Install/Reload the Quick Fill extension:**
   - Navigate to `chrome://extensions/`
   - If already installed, click the reload icon
   - If not installed, click "Load unpacked" and select the `quick-fill` directory

2. **Visit your application:**
   - Go to any page with form fields
   - Example: Registration form, expense report form, etc.

3. **Click the Quick Fill extension icon:**
   - The extension icon in your Chrome toolbar
   - Forms should auto-fill with custom data
   - You should see a notification: **"Quick Fill: X fields filled (using custom data)"**

4. **Check the browser console:**
   - Open DevTools (F12)
   - Look for: `Quick Fill: Using custom data for localhost` (or your domain)
   - If you see this, the custom data is being loaded successfully

### 4. Troubleshooting

**Extension not using custom data:**

1. **Check if file is accessible:**
   ```bash
   curl http://localhost:3000/.well-known/quick-fill-data.json
   ```
   If this fails, the file isn't being served correctly.

2. **Check browser console for errors:**
   - Open DevTools (F12) → Console tab
   - Look for Quick Fill messages
   - Common errors:
     - `404 Not Found` - File not accessible at the expected URL
     - `CORS error` - Shouldn't happen for same-origin, but check if using a proxy
     - `Invalid JSON` - Syntax error in the JSON file

3. **Verify JSON is valid:**
   ```bash
   cat .well-known/quick-fill-data.json | jq .
   ```
   Or use an online validator: https://jsonlint.com/

4. **Clear extension cache:**
   - The extension caches the custom data per domain
   - To force reload: Close and reopen Chrome
   - Or: Reload the extension in `chrome://extensions/`

5. **Check same-origin policy:**
   - Custom data must be served from the same origin (protocol + domain + port)
   - If using a reverse proxy or different port, this might cause issues

**Fields not filling correctly:**

1. **Field matching is case-insensitive and partial:**
   - Field with `name="policy_area"` will match mapping key `policy_area`
   - Field with `name="policyArea"` will also match `policy_area` (partial match)

2. **Add more specific mappings:**
   - If a field isn't matching, check the field's `name`, `id`, and `type` attributes
   - Add a more specific mapping key to `fieldMappings` in the JSON file

3. **Use browser DevTools to inspect fields:**
   - Right-click field → Inspect
   - Check the `name` and `id` attributes
   - Add matching keys to `fieldMappings`

## What's Included in the Custom Data

### 9 Coordinated Personas
- 6 original lobbyists from seed data (John Doe, Jane Smith, Michael Chen, Sarah Martinez, Robert Johnson, Emily Wong)
- 3 additional lobbyists (David Thompson, Lisa Rodriguez, James Park)
- Each persona includes:
  - Standard fields: name, email, phone, address, city, state, zip, company, username, password
  - Custom fields: policyArea, subjectsOfInterest, hoursThisQuarter, status, registrationDate

### Field Mappings
Extensive mappings for domain-specific data:
- **Emails** - All user accounts (admin, lobbyists, employers, board members)
- **Phones** - Portland area code format (503-555-XXXX)
- **Passwords** - Role-specific passwords (lobbyist123, employer123, etc.)
- **Policy Areas** - Technology, Healthcare, Environment, Education, Transportation, Housing, Labor, etc.
- **Organizations** - TechCorp Industries, Healthcare Advocates Group, Green Energy Coalition, etc.
- **Portland Restaurants** - Jake's Famous Crawfish, Portland City Grill, Le Pigeon, etc.
- **Expense Amounts** - Realistic values ($65-$198)
- **Addresses & Zip Codes** - Portland-specific (97201-97212)
- **Status Values** - APPROVED, PENDING, SUSPENDED, REVOKED
- **Roles** - ADMIN, LOBBYIST, EMPLOYER, BOARD_MEMBER, PUBLIC
- **And much more...**

## How the Extension Works

### Three-Tier Fallback System

When filling a field, the extension tries in this order:

1. **Custom Field Mappings** (highest priority)
   - Checks `fieldMappings` in your JSON for matching keys
   - Example: Field with `name="policy_area"` gets value from `fieldMappings.policy_area`

2. **Custom Personas**
   - Uses standard persona fields (firstName, lastName, email, etc.)
   - Uses custom persona fields (anything in `persona.custom`)
   - Example: Field with `name="firstName"` gets value from persona's `firstName`

3. **Realistic Random Data** (default fallback)
   - If no custom data matches, generates realistic random data
   - Uses curated lists of names, addresses, companies, etc.
   - Example: Field with `name="firstName"` gets random realistic first name

### Field Matching Logic

The extension matches fields using **partial, case-insensitive matching**:

- Field `name="customer_id"` matches mapping key `customer_id`
- Field `name="customerId"` also matches mapping key `customer_id` (partial match)
- Field `id="policy-area-select"` matches mapping key `policy_area`

This flexible matching means you don't need exact key matches.

## Deployment Considerations

### Development Environment
- File should be at: `http://localhost:3000/.well-known/quick-fill-data.json`
- No special configuration needed if using Next.js with `public` directory

### Staging Environment
- File should be at: `https://staging.yourdomain.com/.well-known/quick-fill-data.json`
- Verify file is accessible after deployment
- Consider using environment-specific data if needed

### Production Environment
- **Security Note:** The JSON file is publicly accessible
- Only include **synthetic test data** - never real user information
- Consider whether you want this enabled in production
- Options:
  - Don't deploy the `.well-known` directory to production
  - Use environment variables to conditionally include the file
  - Deploy to staging only

### Vercel Deployment
If using Vercel, ensure the `.well-known` directory is included:

1. Check `.vercelignore` doesn't exclude `.well-known`
2. Add to `vercel.json` if needed (see Option C above)
3. Verify after deployment: `https://yourapp.vercel.app/.well-known/quick-fill-data.json`

### Docker Deployment
Ensure the `.well-known` directory is copied into the container:

```dockerfile
# Make sure to copy the .well-known directory
COPY .well-known ./well-known
# Or if using public directory:
COPY public/.well-known ./public/.well-known
```

## Maintenance

### Adding New Data

To add more personas or field mappings:

1. Edit `.well-known/quick-fill-data.json`
2. Add new persona objects to the `personas` array
3. Add new field mappings to the `fieldMappings` object
4. Validate the JSON: `cat .well-known/quick-fill-data.json | jq .`
5. Redeploy or restart dev server
6. Clear extension cache (close/reopen Chrome or reload extension)

### Updating Existing Data

1. Edit the JSON file
2. Validate changes
3. If deployed, redeploy to see changes
4. Clear extension cache to force reload

## Benefits

### For Developers
- **Faster testing** - No manual data entry
- **Consistent test data** - Same realistic values every time
- **Domain-specific** - Values that match your validation rules

### For Demos
- **Professional appearance** - Realistic Portland restaurants, addresses, policy areas
- **Coordinated data** - Names match emails, addresses are real Portland locations
- **Story coherence** - Technology lobbyists discuss IT policy, Healthcare lobbyists discuss Medicaid

### For QA
- **Standardized test data** - Everyone uses the same test values
- **Easier bug reproduction** - Known test data makes issues easier to recreate
- **Faster test cycles** - Spend less time filling forms, more time testing

## Additional Resources

- **Quick Fill Documentation:** See `quick-fill/CUSTOM-DATA.md` for complete documentation
- **Example Data:** See `quick-fill/example-custom-data.json` for schema reference
- **Extension Source:** See `quick-fill/` directory for implementation details

## Questions?

If you have issues or questions:
1. Check the troubleshooting section above
2. Verify the file is accessible at the expected URL
3. Check browser console for Quick Fill messages
4. Review the field matching logic
5. Contact Ian Swanson for assistance
