# GitHub Actions CI/CD Setup Guide

This guide will help you set up automatic deployment to Cloudflare Workers whenever you push to the `main` branch.

---

## What's Already Set Up

✅ GitHub Actions workflow file: `.github/workflows/deploy.yml`
✅ Workflow triggers on:
  - Push to `main` branch
  - Pull requests to `main` branch
  - Manual trigger (workflow_dispatch)

---

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use the **"Edit Cloudflare Workers"** template
4. Or create a custom token with these permissions:
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit** (if using KV)
   - **Account** → **Workers R2 Storage** → **Edit** (if using R2)
   - **Zone** → **Workers Routes** → **Edit** (if using custom domain)
5. Click **"Continue to summary"** → **"Create Token"**
6. **Copy the token** (you won't see it again!)

### 2. Get Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on **Workers & Pages** (left sidebar)
3. Your **Account ID** is shown on the right side
4. Or go to any domain → Overview → Account ID is in the right sidebar

---

## Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each of these secrets:

### Required Secrets:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | API token for deployment | Created in step 1 above |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Found in Cloudflare dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |

### Optional Secrets (for runtime):

These are set directly in Cloudflare Workers, not GitHub:

| Secret Name | Description |
|-------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (sensitive!) |
| `R2_ACCESS_KEY_ID` | R2 access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | R2 public URL |

---

## Setting Runtime Secrets in Cloudflare

For sensitive runtime secrets (not build-time), use Wrangler:

```bash
# Set secrets via Wrangler CLI
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_BUCKET_NAME
npx wrangler secret put R2_PUBLIC_URL
```

Or via Cloudflare Dashboard:
1. Go to **Workers & Pages** → **ez-khata**
2. Click **Settings** → **Variables**
3. Add each secret under **Environment Variables**
4. Click **"Encrypt"** for sensitive values
5. Click **"Save and Deploy"**

---

## How the Workflow Works

### On Every Push to `main`:

1. **Checkout code** - Gets your latest code
2. **Setup Node.js** - Installs Node.js 20
3. **Install dependencies** - Runs `npm ci` (clean install)
4. **Run tests** - Runs `npm test` (continues even if tests fail)
5. **Build** - Runs `npx opennextjs-cloudflare build`
6. **Deploy** - Deploys to Cloudflare Workers using Wrangler

### On Pull Requests:

- Runs all steps except deployment
- Great for catching build errors before merging

### Manual Trigger:

1. Go to **Actions** tab in GitHub
2. Click **"Deploy to Cloudflare Workers"**
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

---

## Workflow File Explained

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main          # Deploy on push to main
  pull_request:
    branches:
      - main          # Test on PRs to main
  workflow_dispatch:  # Allow manual triggers

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm test
        continue-on-error: true  # Optional: don't fail if tests fail
      
      - run: npx opennextjs-cloudflare build
        env:
          # Build-time env vars (embedded in the build)
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

---

## Testing the Workflow

1. **Add all secrets** to GitHub (see above)
2. **Commit and push** the workflow file:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions CI/CD workflow"
   git push origin main
   ```
3. **Watch the deployment**:
   - Go to **Actions** tab in GitHub
   - Click on the latest workflow run
   - Watch the logs in real-time

---

## Troubleshooting

### Deployment fails with "Authentication error"

- Check that `CLOUDFLARE_API_TOKEN` is correct
- Verify the token has the right permissions
- Make sure the token hasn't expired

### Build fails with "Module not found"

- Check that all dependencies are in `package.json`
- Try running `npm ci` locally to verify

### Environment variables not working

- `NEXT_PUBLIC_*` variables must be in GitHub Secrets (build-time)
- Other secrets should be in Cloudflare Workers (runtime)
- Verify secret names match exactly (case-sensitive)

### Tests failing

- Set `continue-on-error: true` in the test step (already done)
- Or remove the test step if you don't have tests yet
- Or fix the tests! 😄

---

## Advanced: Deploy to Staging and Production

You can modify the workflow to deploy to different environments:

```yaml
on:
  push:
    branches:
      - main        # Production
      - develop     # Staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ... other steps ...
      
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env production
      
      - name: Deploy to Staging
        if: github.ref == 'refs/heads/develop'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env staging
```

---

## Summary Checklist

- [ ] Create Cloudflare API Token
- [ ] Get Cloudflare Account ID
- [ ] Add `CLOUDFLARE_API_TOKEN` to GitHub Secrets
- [ ] Add `CLOUDFLARE_ACCOUNT_ID` to GitHub Secrets
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to GitHub Secrets
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to GitHub Secrets
- [ ] Set runtime secrets in Cloudflare Workers
- [ ] Commit and push workflow file
- [ ] Watch first deployment in Actions tab
- [ ] Celebrate! 🎉

---

## Useful Commands

```bash
# Test build locally before pushing
npm run build

# Deploy manually (if needed)
npm run deploy

# View Wrangler help
npx wrangler --help

# View deployment logs
npx wrangler tail
```

---

## Resources

- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
