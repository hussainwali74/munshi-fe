# Deployment Documentation Index

This directory contains comprehensive guides for deploying your Next.js application to Cloudflare Workers.

---

## 📚 Documentation Files

### 1. [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
**Complete guide for setting up CI/CD with GitHub Actions**
- How to get Cloudflare API token
- How to add GitHub secrets
- Workflow configuration explained
- Troubleshooting common issues

### 2. [WORKFLOWS_OVERVIEW.md](./WORKFLOWS_OVERVIEW.md)
**Overview of all GitHub Actions workflows**
- Test workflow details
- Deployment workflow details
- How to monitor deployments
- Customization options

### 3. [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md)
**Guide for connecting your Ionos domain to Cloudflare**
- How to add domain to Cloudflare
- Updating nameservers at Ionos
- SSL/TLS configuration
- DNS setup

### 4. [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)
**Original deployment guide (for reference)**
- OpenNext configuration
- Cloudflare Pages vs Workers
- Environment variables setup
- R2 bucket configuration

---

## 🚀 Quick Start

### Option 1: Manual Deployment (Fastest)

```bash
# Deploy directly from your machine
npm run deploy
```

Your site will be live at: `https://ez-khata.hussain-wali2023.workers.dev/`

### Option 2: CI/CD with GitHub Actions (Recommended)

1. **Run the setup helper:**
   ```bash
   ./setup-github-actions.sh
   ```

2. **Add secrets to GitHub:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add the 4 required secrets (see helper output)

3. **Commit and push:**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add CI/CD workflow"
   git push origin main
   ```

4. **Watch the magic happen:**
   - Go to Actions tab in GitHub
   - Watch your deployment in real-time

---

## 🌐 Custom Domain Setup

1. **Add domain to Cloudflare** (see [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md))
2. **Update nameservers at Ionos**
3. **Update `wrangler.jsonc`** with your domain
4. **Deploy:** `npm run deploy`

---

## 🔐 Environment Variables

### Build-time (GitHub Secrets):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Runtime (Cloudflare Workers):
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

Set runtime secrets:
```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# ... repeat for other secrets
```

---

## 📊 Deployment Status

### Current Deployment:
- **Worker URL:** https://ez-khata.hussain-wali2023.workers.dev/
- **Custom Domain:** (pending setup)
- **CI/CD:** GitHub Actions (pending setup)

### Check Status:
- **Cloudflare:** https://dash.cloudflare.com → Workers & Pages → ez-khata
- **GitHub:** https://github.com/YOUR_USERNAME/YOUR_REPO/actions

---

## 🛠️ Useful Commands

```bash
# Build locally
npm run build

# Deploy manually
npm run deploy

# Preview locally
npm run preview

# View deployment logs
npx wrangler tail

# Check who you're logged in as
npx wrangler whoami

# Set a secret
npx wrangler secret put SECRET_NAME
```

---

## 📝 Files Overview

```
.
├── .github/
│   └── workflows/
│       ├── deploy.yml           # CI/CD deployment workflow
│       └── test.yml             # Test workflow
├── wrangler.jsonc               # Cloudflare Workers config
├── open-next.config.ts          # OpenNext build config
├── setup-github-actions.sh      # Setup helper script
├── GITHUB_ACTIONS_SETUP.md      # CI/CD setup guide
├── WORKFLOWS_OVERVIEW.md        # Workflows overview
├── CUSTOM_DOMAIN_SETUP.md       # Domain setup guide
└── CLOUDFLARE_DEPLOYMENT.md     # Deployment reference
```

---

## 🎯 Next Steps

1. ✅ Manual deployment working
2. ⏳ Set up GitHub Actions CI/CD
3. ⏳ Connect custom domain
4. ⏳ Add runtime secrets to Cloudflare
5. ⏳ Test everything end-to-end

---

## 🆘 Need Help?

- Check the specific guide for your issue
- Review the troubleshooting sections
- Check Cloudflare Workers logs
- Check GitHub Actions logs

---

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
