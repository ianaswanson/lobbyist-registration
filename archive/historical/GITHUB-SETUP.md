# GitHub Setup - Quick Steps

## Step 1: Create Repository on GitHub

1. **Go to:** https://github.com/new

2. **Fill in:**
   - Repository name: `lobbyist-registration`
   - Description: `Multnomah County Lobbyist Registration System`
   - Privacy: **Private** (recommended)
   - ❌ Do NOT check "Initialize with README"
   - ❌ Do NOT add .gitignore
   - ❌ Do NOT add license

3. **Click:** "Create repository"

4. **Copy the URL** from the page (looks like):
   ```
   https://github.com/YOUR_USERNAME/lobbyist-registration.git
   ```

## Step 2: Tell Claude Your GitHub Username

Just reply with your GitHub username (e.g., "ianswanson" or "ianaswanson") and I'll do the rest!

---

## Or Do It Yourself (Optional)

If you want to do it manually:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/lobbyist-registration.git
git push -u origin main
```

Then tell me when it's done!
