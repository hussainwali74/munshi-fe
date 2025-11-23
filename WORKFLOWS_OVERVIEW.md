# GitHub Actions Workflows Overview

Your repository has the following GitHub Actions workflows set up:

---

## 1. 🧪 Run Tests (`test.yml`)

**Triggers:**
- On every push to `main` branch
- On every pull request

**What it does:**
- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Runs tests (`npm test`)

**Purpose:** Ensures code quality and catches bugs before deployment

---

## 2. 🚀 Deploy to Cloudflare Workers (`deploy.yml`)

**Triggers:**
- On every push to `main` branch
- On pull requests to `main` branch
- Manual trigger (via Actions tab)

**What it does:**
- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Runs tests (continues even if they fail)
- Builds with OpenNext Cloudflare
- Deploys to Cloudflare Workers

**Purpose:** Automatic deployment to production

---

## Workflow Execution Order

When you push to `main`:

1. **Test workflow** runs first (fast, ~2-3 minutes)
2. **Deploy workflow** runs in parallel
   - Runs tests again
   - Builds the application (~3-5 minutes)
   - Deploys to Cloudflare Workers (~30 seconds)

**Total time:** ~5-8 minutes from push to live deployment

---

## Required Secrets

Make sure these are set in GitHub Settings → Secrets and variables → Actions:

### For Deployment:
- ✅ `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- ✅ `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (build-time)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (build-time)

### For Runtime (set in Cloudflare Workers):
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

---

## How to Use

### Automatic Deployment
Just push to `main`:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

The deployment will happen automatically!

### Manual Deployment
1. Go to GitHub → Actions tab
2. Click "Deploy to Cloudflare Workers"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### View Deployment Status
1. Go to GitHub → Actions tab
2. Click on the latest workflow run
3. Watch the logs in real-time

---

## Workflow Files Location

```
.github/
└── workflows/
    ├── test.yml       # Test workflow
    └── deploy.yml     # Deployment workflow
```

---

## Customization

### Deploy only on specific branches
Edit `deploy.yml`:
```yaml
on:
  push:
    branches:
      - main
      - production  # Add more branches
```

### Skip deployment on specific commits
Add `[skip ci]` to your commit message:
```bash
git commit -m "Update README [skip ci]"
```

### Add deployment notifications
Add a Slack/Discord notification step to `deploy.yml`

---

## Monitoring

### View Deployment Logs
- **GitHub:** Actions tab → Click on workflow run
- **Cloudflare:** Workers & Pages → ez-khata → Logs

### Check Deployment Status
- **GitHub:** Green checkmark = success, Red X = failed
- **Cloudflare:** Workers & Pages → ez-khata → Deployments

---

## Troubleshooting

### Deployment fails but tests pass
- Check Cloudflare API token is valid
- Verify account ID is correct
- Check Cloudflare dashboard for errors

### Tests fail on GitHub but pass locally
- Check Node.js version matches (20)
- Verify all dependencies are in `package.json`
- Check for environment-specific issues

### Build takes too long
- Current build time: ~5-8 minutes (normal)
- To speed up: Enable caching (already enabled)
- Consider using Turborepo for monorepos

---

## Next Steps

1. ✅ Commit the workflow files
2. ✅ Add required secrets to GitHub
3. ✅ Push to `main` and watch the magic happen!
4. ✅ Set up custom domain (see `CUSTOM_DOMAIN_SETUP.md`)
5. ✅ Add runtime secrets to Cloudflare Workers

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
