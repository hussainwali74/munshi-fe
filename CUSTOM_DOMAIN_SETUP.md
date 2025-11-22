# Custom Domain Setup Guide

## Your Current Setup
- ✅ Worker deployed: `https://ez-khata.hussain-wali2023.workers.dev/`
- 🔄 Domain registered with: **Ionos**
- 🎯 Goal: Connect your Ionos domain to Cloudflare Workers

---

## Step-by-Step Guide

### Step 1: Add Your Domain to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a site"** (top right)
3. Enter your domain name (e.g., `ezkhata.com`)
4. Click **"Add site"**
5. Select the **Free** plan
6. Click **"Continue"**
7. Cloudflare will scan your existing DNS records - review and click **"Continue"**

### Step 2: Update Nameservers at Ionos

Cloudflare will show you 2 nameservers like:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

Now update these at Ionos:

1. Log in to [Ionos](https://www.ionos.com/)
2. Go to **Domains & SSL**
3. Click on your domain
4. Find **Nameserver Settings** (might be under "DNS" or "Domain Settings")
5. Click **"Change Nameservers"** or **"Use Custom Nameservers"**
6. Replace Ionos nameservers with Cloudflare's nameservers:
   - Nameserver 1: `ns1.cloudflare.com` (or whatever Cloudflare gave you)
   - Nameserver 2: `ns2.cloudflare.com`
7. Save changes

**⏰ Wait Time:** DNS propagation can take 24-48 hours, but usually happens within 2-6 hours.

### Step 3: Verify Domain is Active on Cloudflare

1. Go back to Cloudflare Dashboard
2. You should see your domain listed
3. Wait for the status to change from "Pending" to "Active"
4. You'll receive an email when it's active

### Step 4: Update `wrangler.jsonc` with Your Domain

Replace `yourdomain.com` in `wrangler.jsonc` with your actual domain:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "ez-khata",
  "compatibility_date": "2025-11-21",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "routes": [
    {
      "pattern": "ezkhata.com/*",
      "zone_name": "ezkhata.com"
    },
    {
      "pattern": "www.ezkhata.com/*",
      "zone_name": "ezkhata.com"
    }
  ]
}
```

**Replace `ezkhata.com` with your actual domain!**

### Step 5: Deploy with Custom Domain

Once your domain is active on Cloudflare, deploy again:

```bash
npm run deploy
```

This will automatically set up the routes for your custom domain.

---

## Alternative: Add Domain via Cloudflare Dashboard

If you prefer using the dashboard instead of `wrangler.jsonc`:

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Click on your worker: **ez-khata**
3. Go to **Settings** → **Triggers**
4. Under **Custom Domains**, click **"Add Custom Domain"**
5. Enter your domain (e.g., `ezkhata.com`)
6. Click **"Add Custom Domain"**
7. Repeat for `www.ezkhata.com` if needed

---

## Step 6: Set Up SSL/TLS (Automatic)

Cloudflare automatically provides SSL certificates for your domain:

1. Go to **Cloudflare Dashboard** → Your domain → **SSL/TLS**
2. Set encryption mode to **"Full"** or **"Full (strict)"**
3. Wait a few minutes for the certificate to be issued

---

## Step 7: Add DNS Records (if needed)

If you're using subdomains or need specific DNS records:

1. Go to **Cloudflare Dashboard** → Your domain → **DNS** → **Records**
2. Add any additional records you need:
   - **A record** for root domain (if not using Workers route)
   - **CNAME** for www (if not using Workers route)
   - **MX records** for email (if you have email on this domain)

**Note:** If you're using Workers routes (which you are), the DNS records are handled automatically.

---

## Troubleshooting

### Domain not working after 24 hours?

1. Check nameservers at Ionos are correctly set to Cloudflare's
2. Use [WhatsMyDNS](https://www.whatsmydns.net/) to check DNS propagation
3. Clear your browser cache and try incognito mode

### SSL certificate errors?

1. Wait 10-15 minutes after adding the domain
2. Check SSL/TLS mode is set to "Full" or "Full (strict)"
3. Try accessing via `https://` explicitly

### Worker not responding on custom domain?

1. Verify the domain is "Active" in Cloudflare
2. Check the routes in `wrangler.jsonc` match your domain exactly
3. Redeploy: `npm run deploy`
4. Check Worker logs in Cloudflare Dashboard → Workers & Pages → ez-khata → Logs

---

## Environment Variables

Don't forget to add your environment variables to the Worker:

### Via Wrangler CLI:
```bash
# Add secrets (sensitive data)
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put R2_SECRET_ACCESS_KEY

# Add regular env vars
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_BUCKET_NAME
npx wrangler secret put R2_PUBLIC_URL
```

### Via Dashboard:
1. Go to **Workers & Pages** → **ez-khata** → **Settings** → **Variables**
2. Add each environment variable
3. Click **"Save and Deploy"**

---

## Summary

1. ✅ Add domain to Cloudflare
2. ✅ Update nameservers at Ionos
3. ✅ Wait for domain to become active
4. ✅ Update `wrangler.jsonc` with your domain
5. ✅ Deploy: `npm run deploy`
6. ✅ Add environment variables
7. ✅ Test your domain!

Your site will be available at:
- `https://yourdomain.com`
- `https://www.yourdomain.com`
- `https://ez-khata.hussain-wali2023.workers.dev` (worker URL still works)
