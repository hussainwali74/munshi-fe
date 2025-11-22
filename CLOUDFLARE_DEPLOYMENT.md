# Cloudflare Deployment Guide for OpenNext

## Prerequisites

Before deploying, you need to have these configuration files in your project root:

### 1. `open-next.config.ts`
This file configures OpenNext build settings. It was **automatically created** when you first ran `npx opennextjs-cloudflare build`.

**Current configuration:**
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
```

### 2. `wrangler.jsonc`
This file configures Cloudflare Workers/Pages deployment. It was **also automatically created** during the first build.

**Current configuration:**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "khata-app",
  "compatibility_date": "2025-11-21",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "cache"
    }
  ]
}
```

**Note:** Both files are already in your repository and should be committed to git.

---

## Important: Deployment Method

OpenNext for Cloudflare is designed to deploy as a **Cloudflare Worker**, not traditional Cloudflare Pages. However, you can still use Cloudflare Pages with the correct configuration.

## Option 1: Deploy via Cloudflare Pages (Recommended)

### Step 1: Configure Cloudflare Pages Build Settings

In your Cloudflare Pages project settings:

**Framework preset**: None (or Custom)

**Build command**:
```bash
npx opennextjs-cloudflare build
```

**Build output directory**:
```
.open-next
```

**Root directory**: (leave blank or `/`)

### Step 2: Environment Variables

Add these in Cloudflare Pages → Settings → Environment Variables:

**Production & Preview environments:**
- `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
- `R2_ACCESS_KEY_ID` = Your R2 access key ID
- `R2_SECRET_ACCESS_KEY` = Your R2 secret access key
- `R2_BUCKET_NAME` = Your R2 bucket name (e.g., "khata-images")
- `R2_PUBLIC_URL` = Your R2 public URL (e.g., "https://cdn.ezkhata.com")
- `NODE_ENV` = production

### Step 3: R2 Bucket Bindings

You need to bind your R2 buckets in Cloudflare Pages:

1. Go to your Pages project → Settings → Functions
2. Add R2 bucket bindings:
   - **Variable name**: `NEXT_INC_CACHE_R2_BUCKET`
   - **R2 bucket**: `cache` (create this bucket first if it doesn't exist)

### Step 4: Create R2 Buckets

Before deploying, create the required R2 buckets:

```bash
# For incremental cache
npx wrangler r2 bucket create cache

# For your images (if not already created)
npx wrangler r2 bucket create khata-images
```

### Step 5: Compatibility Flags

In Cloudflare Pages → Settings → Functions, add these compatibility flags:
- `nodejs_compat`
- `global_fetch_strictly_public`

---

## Option 2: Deploy via Wrangler CLI (Alternative)

If Pages deployment doesn't work, you can deploy directly as a Worker:

```bash
# Deploy to Cloudflare Workers
npx wrangler deploy

# Or for preview
npx wrangler dev
```

---

## Troubleshooting

### Error: "Output directory .vercel/output/static not found"

This means Cloudflare Pages is not recognizing the OpenNext output. Make sure:
1. Build output directory is set to `.open-next` (not `.vercel/output/static`)
2. The build command is `npx opennextjs-cloudflare build`

### ESLint Errors During Build

Fixed in the latest commit by updating `eslint.config.mjs` to use `.js` extensions.

### React Compiler Warning

Fixed in the latest commit by moving `reactCompiler` to `experimental` config.

---

## Post-Deployment

After successful deployment:

1. **Test your application** at the Cloudflare Pages URL
2. **Configure custom domain** in Cloudflare Pages → Custom domains
3. **Monitor logs** in Cloudflare Dashboard → Workers & Pages → Your project → Logs
4. **Set up R2 public access** for image URLs to work correctly

---

## Important Files

- `wrangler.jsonc` - Cloudflare Workers configuration (auto-generated on first build)
- `open-next.config.ts` - OpenNext build configuration (auto-generated on first build)
- `.gitignore` - Excludes `.open-next` build artifacts

**Do NOT commit** the `.open-next` folder to git!

---

## FAQ

### How were `wrangler.jsonc` and `open-next.config.ts` created?

These files were **automatically generated** the first time you ran:
```bash
npx opennextjs-cloudflare build
```

The CLI prompted you with:
- ✔ Missing required `open-next.config.ts` file, do you want to create one? (Y/n) · **true**
- ✔ No `wrangler.(toml|json|jsonc)` config file found, do you want to create one? (Y/n) · **true**

After answering "yes" to both, the files were created with sensible defaults.

### Can I customize these files?

Yes! You can modify:
- **`wrangler.jsonc`**: Change app name, add more R2 buckets, add KV namespaces, etc.
- **`open-next.config.ts`**: Configure caching strategies, add custom overrides, etc.

### Do I need to run the build command locally before deploying?

No! Cloudflare Pages will run `npx opennextjs-cloudflare build` automatically during deployment. However, running it locally first helps catch errors early.

