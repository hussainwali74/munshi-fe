# Deployment & Setup Guide

**Last Updated:** November 2025

This guide will walk you through setting up the complete backend infrastructure for the **Digital Dukan / Khata App** - from database setup to deployment on Cloudflare Pages.

---

## Overview

This application uses:
- **Supabase** - PostgreSQL database (we use custom auth, not Supabase Auth)
- **Cloudflare R2** - Image storage for product photos
- **Cloudflare Pages** - Hosting and deployment
- **Custom Authentication** - JWT-based sessions (vendor-independent)
- **Custom Domain (Optional)** - Your own domain from any registrar (e.g., Ionos, GoDaddy, Namecheap)

---

## Part 1: Supabase Setup (Database)

Supabase provides a managed PostgreSQL database. We use it purely as a database host, not for authentication.

### 1.1 Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com) and sign in/create an account
2.  Click **"New Project"**
3.  Choose your organization (or create one)
4.  **Project Settings:**
    - **Name:** `khata-app` (or your preferred name)
    - **Database Password:** Generate a strong password and save it securely
    - **Region:** Choose the closest to Pakistan:
      - Recommended: **Singapore (ap-southeast-1)** or **Mumbai (ap-south-1)**
    - **Pricing Plan:** Free tier is perfect to start (500MB database, 1GB file storage)
5.  Click **"Create new project"** and wait ~2 minutes for setup

### 1.2 Run Database Schema

1.  Once your project is ready, click **SQL Editor** from the left sidebar (icon: `>_`)
2.  Click **"New query"**
3.  Open the file `supabase/schema.sql` from this project in your code editor
4.  **Copy the entire contents** of the file
5.  **Paste** into the Supabase SQL Editor
6.  Click **"Run"** (or press `Ctrl+Enter`)
7.  You should see: ✅ **"Success. No rows returned"**

This creates all your tables (users, customers, inventory, transactions, employees) and sets up security policies.

### 1.3 Get Database Credentials

**Important:** Supabase introduced new API keys in June 2025 to improve security. This guide uses the **new API keys** system.

1.  Go to **Settings** (gear icon at bottom-left of the Supabase dashboard)
2.  Click **Project Settings** in the dropdown
3.  Click **API Keys** in the left sidebar
4.  You'll see the new API Keys interface with two sections:

#### Project URL
- **Copy the Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
- You'll need this for `NEXT_PUBLIC_SUPABASE_URL`

#### Publishable Key
- This section shows your **Publishable key** (starts with `sb_publishable_...`)
- ❌ **We don't need this key** for our custom auth implementation
- (This replaces the old `anon` key and is safe to use in browsers when using Supabase Auth + RLS)

#### Secret Keys
- Click the **"Secret keys"** section
- You'll see a default secret key (starts with `sb_secret_...`)
- Click the **"Reveal" button** (👁️) next to the default key
- **⚠️ Important:** You may need to confirm your account password
- **Copy this secret key** - you'll need it for `SUPABASE_SERVICE_ROLE_KEY`

> **🔐 Security Note:**  
> Secret keys give **full database access** and bypass Row Level Security. They should **ONLY** be used server-side.  
> - ✅ Safe: Server-side code, API routes, server actions  
> - ❌ Never: Browser/client code, exposed in frontend bundles  
> - ❌ Never: Commit to Git or share publicly

> **💡 Legacy Keys Note:**  
> If you have an older Supabase project, you may still see "Legacy API Keys" tab with `anon` and `service_role` keys. These still work but are being phased out. For new projects or when migrating, use the new `sb_publishable_...` and `sb_secret_...` keys.

---

## Part 2: Cloudflare R2 Setup (Image Storage)

Cloudflare R2 is S3-compatible object storage with zero egress fees - perfect for storing product images.

### 2.1 Create Cloudflare Account

1.  Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2.  Sign up with your email
3.  Verify your email address

### 2.2 Enable R2 & Create Bucket

1.  From the Cloudflare Dashboard, click **R2** in the left sidebar
2.  If this is your first time:
    - You'll need to add a payment method (credit card)
    - **Note:** R2 has a generous free tier:
      - 10 GB storage/month free
      - 10 million Class A operations free
      - 10 million Class B operations free
      - **Zero egress fees** (unlike AWS S3)
3.  Click **"Create bucket"**
4.  **Bucket name:** `khata-app-images` 
    - (Must be globally unique - if taken, try `khata-app-images-786` or add random numbers)
5.  **Location:** Automatic (Cloudflare automatically distributes globally)
6.  Click **"Create bucket"**

### 2.3 Configure Public Access

To make your bucket publicly accessible for serving product images:

1.  Click on your newly created bucket name to open its details
2.  Navigate to the **Settings** tab (at the top of the bucket page)
3.  Scroll down to find the **"Public Development URL"** section
4.  Click the **"Enable"** button
5.  A confirmation prompt will appear: **"Allow Public Access?"**
    - Type `allow` (lowercase) in the text field
    - Click **"Allow"** to confirm
6.  Once enabled, you'll see your **Public Development URL** (e.g., `https://pub-xxxxxxxxxxxxxxxx.r2.dev`)
7.  **Copy this URL** - this is your `R2_PUBLIC_URL` for `.env.local`

> **📌 Important Notes:**
> - The `r2.dev` subdomain is rate-limited and meant for development/testing
> - For production, Cloudflare recommends connecting a custom domain in the **"Custom Domains"** section
> - You can disable public access anytime by clicking "Disable" and typing `disallow`

> **💡 Alternative: Custom Domain (Recommended for Production)**
> 1. In the bucket Settings, find **"Custom Domains"**
> 2. Click **"Add"**
> 3. Enter your domain (e.g., `cdn.yourshop.com`)
> 4. Cloudflare will automatically create the DNS record
> 5. Use your custom domain as `R2_PUBLIC_URL` instead

---
### 2.4 Generate API Tokens

1.  Go back to the main **R2** overview page, you will find **Account ID** here.
2.  On the right side, click **"Manage R2 API Tokens"**
3.  Click **"Create API token"**
4.  **Configuration:**
    - **Token name:** `khata-app-upload`
    - **Permissions:** **"Object Read & Write"** (NOT "Read" which is default!)
    - **TTL:** Leave as default or set to "Forever"
    - **Bucket:** Select your specific bucket, or "Apply to all buckets"
5.  Click **"Create API Token"**
6.  **⚠️ CRITICAL:** This page will show your credentials **ONLY ONCE**:
    - **Access Key ID** - Copy this
    - **Secret Access Key** - Copy this
7.  Save these in a secure location immediately

---

## Part 3: Environment Configuration

Create a `.env.local` file in your project root directory:

```bash
# ===========================================
# DATABASE (Supabase)
# ===========================================
# From Project Settings > API Keys > Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# From Project Settings > API Keys > Secret keys (default key)
# This is the new sb_secret_... key that replaces service_role
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your-key-here

# ===========================================
# AUTHENTICATION
# ===========================================
# Generate a random 32+ character string for JWT signing
# You can generate one at: https://generate-secret.vercel.app/32
JWT_SECRET_KEY=your-super-secret-jwt-key-change-me-in-production

# ===========================================
# CLOUDFLARE R2 (Image Storage)
# ===========================================
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=khata-app-images
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev
```

### Environment Variables Explained:
- **NEXT_PUBLIC_SUPABASE_URL:** Your Supabase project URL (from Section 1.3)
- **SUPABASE_SERVICE_ROLE_KEY:** Your secret key (starts with `sb_secret_...`) for full database access (from Section 1.3)
- **JWT_SECRET_KEY:** Random secret for signing JWT tokens - **MUST BE UNIQUE AND SECRET**
- **R2_ACCOUNT_ID:** Your Cloudflare Account ID (from Part 2.4)
- **R2_ACCESS_KEY_ID:** R2 API token access key (from Part 2.4)
- **R2_SECRET_ACCESS_KEY:** R2 API token secret (from Part 2.4)
- **R2_BUCKET_NAME:** Your bucket name (from Part 2.2)
- **R2_PUBLIC_URL:** Your R2 public URL (from Part 2.3)

---

## Part 4: Local Development

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Run Development Server
```bash
npm run dev
```

### 4.3 Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

### 4.4 Test the Setup
1.  You should see a login page
2.  Click "Create new account"
3.  Fill in the signup form and submit
4.  If successful, you'll be redirected to the dashboard
5.  Navigate to **Settings** and update your shop details
6.  Go to **Inventory** and try adding a product with an image

---

## Part 5: Adding Your Domain to Cloudflare (Optional but Recommended)

If you have a custom domain (e.g., from Ionos, GoDaddy, Namecheap), adding it to Cloudflare gives you:
- Free CDN and DNS management
- Automatic HTTPS certificates
- Easy integration with R2 and Cloudflare Pages
- One unified dashboard for everything

**Skip this section if you want to use the default Cloudflare Pages URL** (e.g., `khata-app.pages.dev`)

### 5.1 Add Domain to Cloudflare

1.  Log in to your **Cloudflare Dashboard** ([dash.cloudflare.com](https://dash.cloudflare.com))
2.  On your Account Home page, click **"Add a Site"** or **"Onboard a domain"**
3.  Enter your domain name (e.g., `yourshop.com`)
4.  Click **"Continue"**
5.  Cloudflare will automatically scan for your existing DNS records
6.  Select a plan:
    - **Free** plan is perfect for this project
    - Click **"Continue"**
7.  Review the DNS records that were imported
    - Make sure important records are there (you can add/edit later)
    - Click **"Continue"**

### 5.2 Get Cloudflare Nameservers

Cloudflare will show you **2 nameservers**, for example:
```
abby.ns.cloudflare.com
will.ns.cloudflare.com
```

**⚠️ Copy these carefully** - you'll need them in the next step.

### 5.3 Update Nameservers at Your Domain Registrar

#### If you bought your domain from **Ionos**:

1.  Log in to your **Ionos account** ([ionos.com](https://www.ionos.com))
2.  Go to **"Domains"** or **"Domains & SSL"**
3.  Click on your domain name
4.  Look for **"Name Server"**, **"Manage Domain"**, or a **gear icon** ⚙️
5.  Click **"Use Custom Name Servers"** or **"Edit Name Server"**
6.  In the fields for **"Name Server 1"** and **"Name Server 2"**:
    - Paste the 2 Cloudflare nameservers (from Step 5.2)
7.  Click **"Save"** or **"Update"**

#### For other registrars (GoDaddy, Namecheap, etc.):
The process is similar - find the nameserver settings in your domain control panel and replace them with Cloudflare's nameservers.

### 5.4 Wait for DNS Propagation

- DNS changes take **5 minutes to 48 hours** to propagate (usually 15-30 minutes)
- Cloudflare will automatically check for the update
- You'll receive an **email** when your domain is active on Cloudflare
- Your domain status in Cloudflare dashboard will change to **"Active"**

> **📌 Important:**
> - You still **own** the domain through your registrar (Ionos, etc.)
> - You're just routing traffic through Cloudflare
> - You'll still renew your domain through your registrar
> - All DNS management now happens in Cloudflare dashboard

---

## Part 6: Deploy to Cloudflare Pages

> **⚠️ Important Note for Next.js 16:**  
> This project uses Next.js 16. Cloudflare Pages deployment for Next.js 16 is currently evolving. We recommend **two deployment options** below based on your needs.

### Option A: Deploy with Vercel (Recommended for Next.js 16 - Easiest)

While this guide focuses on Cloudflare, **Vercel** remains the simplest option for Next.js 16 since it's made by the Next.js team:

1.  Go to [vercel.com](https://vercel.com) and sign in
2.  Click **"Add New Project"** → Select your GitHub repository
3.  Configure environment variables (same ones from Part 3)
4.  Click **"Deploy"**
5.  Connect your custom domain in Vercel's domain settings

**You can still use:**
- ✅ Cloudflare R2 for images (already configured)
- ✅ Supabase for database (already configured)
- ✅ Your Ionos/custom domain (point DNS to Vercel)

---

### Option B: Deploy to Cloudflare Pages (Advanced - For Next.js 16)

If you want everything on Cloudflare, follow these steps. This uses the newer **OpenNext** adapter.

#### 6.1 Prepare Your Code

1.  Make sure your code is pushed to a **Git repository** (GitHub, GitLab, or Bitbucket)
2.  Ensure `.env.local` is in your `.gitignore`

#### 6.2 Note on Next.js 16 Compatibility

As of November 2025, Cloudflare's Next.js support is officially stable for Next.js 14 and 15. Next.js 16 support is emerging but may require additional configuration. Watch for updates at:
- [Cloudflare Pages Next.js Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [@opennextjs/cloudflare GitHub](https://github.com/opennextjs/opennextjs-cloudflare)

#### 6.3 Alternative: Downgrade to Next.js 15 (If Needed)

If you encounter issues with Next.js 16 on Cloudflare, you can temporarily downgrade:

```bash
npm install next@15 react@18 react-dom@18
```

Then rebuild and deploy. Your app will work  identically since we're not using Next.js 16-specific features yet.

#### 6.4 Create Cloudflare Pages Project (Using Git Integration)

1.  Go to your **Cloudflare Dashboard** ([dash.cloudflare.com](https://dash.cloudflare.com))
2.  In the left sidebar, click **"Workers & Pages"**
3.  Click **"Create"** → **"Pages"** → **"Connect to Git"**
4.  **Connect your repository:**
    - Authorize Cloudflare to access GitHub/GitLab
    - Select your `khata-app` repository
5.  **Configure build settings:**
    - **Project name**: `khata-app`
    - **Production branch**: `main`
    - **Framework preset**: Select **"Next.js (Static HTML Export)"** or **"Next.js"**
    - **Build command**: `npx next build`
    - **Build output directory**: `out` (if using static export) or `.next` 
6.  **Environment variables** - Add all from Part 3 (see table below)

#### 6.5 Add Environment Variables

Scroll to **"Environment variables (advanced)"** and add:

| Variable Name                  | Production | Preview |
|--------------------------------|------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL`     | ✓          | ✓       |
| `SUPABASE_SERVICE_ROLE_KEY`    | ✓          | ✓       |
| `JWT_SECRET_KEY`               | ✓          | ✓       |
| `R2_ACCOUNT_ID`                | ✓          | ✓       |
| `R2_ACCESS_KEY_ID`             | ✓          | ✓       |
| `R2_SECRET_ACCESS_KEY`         | ✓          | ✓       |
| `R2_BUCKET_NAME`               | ✓          | ✓       |
| `R2_PUBLIC_URL`                | ✓          | ✓       |

#### 6.6 Deploy

1.  Click **"Save and Deploy"**
2.  Monitor the build logs
3.  If successful: Your app is at `https://khata-app.pages.dev`
4.  If build fails: Check logs and consider Option A (Vercel) for Next.js 16

#### 6.7 Connect Custom Domain

If your domain is already in Cloudflare (from Part 5):

1.  Go to your Pages project → **"Custom domains"**
2.  Click **"Set up a custom domain"**
3.  Enter your domain (e.g., `yourshop.com` or `app.yourshop.com`)
4.  Cloudflare auto-creates DNS records
5.  SSL provisions automatically in 1-5 minutes

#### 6.8 R2 Custom Domain (Optional)

1.  R2 → Your bucket → Settings → **"Custom Domains"** → **"Add"**
2.  Enter: `cdn.yourshop.com` or `images.yourshop.com`
3.  Update `R2_PUBLIC_URL` in Pages settings
4.  Redeploy your app

---

## Part 7: Post-Deployment

### 7.1 Test Your App
1.  Visit your URL (Vercel or Cloudflare Pages)
2.  Create a test account
3.  Add customers, inventory items, transactions
4.  Test image uploads

### 7.2 Monitor & Maintain
- **Deployment Platform:** Check build logs and analytics
- **Supabase:** Monitor database usage
- **Cloudflare R2:** Check storage and bandwidth
- **Domain:** Ensure SSL is active and renew domain annually

### 7.3 Automatic Deployments
Both Vercel and Cloudflare Pages auto-deploy when you push to Git:
- Main branch → Production
- Other branches → Preview URLs

### 7.4 Backup Data
- Export Supabase data regularly via SQL Editor
- Or upgrade to Supabase Pro ($25/month) for automated backups

---

## Troubleshooting

### Database Connection Issues
- ✅ Check that `SUPABASE_SERVICE_ROLE_KEY` is correct (starts with `sb_secret_...`)
- ✅ Verify the SQL schema ran successfully without errors
- ✅ Make sure RLS policies are set up (run `schema.sql` again if needed)

### Image Upload Issues
- ✅ Verify R2 bucket has public access enabled
- ✅ Check that API token has **"Object Read & Write"** permissions
- ✅ Ensure `R2_PUBLIC_URL` matches your bucket's public URL exactly

### Authentication Issues
- ✅ Make sure `JWT_SECRET_KEY` is set and is at least 32 characters
- ✅ Check that middleware is running (should redirect to `/login` if not authenticated)

### Build Errors
- ✅ Run `npm run build` locally first to catch TypeScript errors
- ✅ Check deployment platform build logs for specific error messages
- ✅ Ensure all environment variables are set correctly
- **If using Cloudflare Pages**:
  - Next.js 16 support is evolving - consider Option A (Vercel) if you encounter issues
  - Check [Cloudflare Pages status page](https://www.cloudflarestatus.com/) for ongoing issues
- **If using Vercel**:
  - Vercel has native Next.js 16 support
  - Check [Vercel status](https://www.vercel-status.com/) if builds are failing

### Domain Issues
- ✅ Verify nameservers are pointing to Cloudflare (check with your registrar)
- ✅ Wait at least 30 minutes for DNS propagation
- ✅ Check domain status in Cloudflare dashboard (should show "Active")
- ✅ Ensure SSL certificate has been provisioned (usually automatic)

---

## Security Best Practices

1.  **Never commit `.env.local`** to version control
2.  **Use strong passwords** for Supabase and user accounts
3.  **Rotate API keys** periodically (every 3-6 months)
4.  **Enable 2FA** on Cloudflare, Ionos/your registrar, and Supabase accounts
5.  **Monitor logs** regularly for suspicious activity
6.  **Keep dependencies updated:** Run `npm audit` and `npm update` monthly
7.  **Review Cloudflare security settings:** Enable WAF, DDoS protection, and bot management as needed

---

## Support & Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Cloudflare R2 Docs:** [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2)
- **Cloudflare Pages Docs:** [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Next.js on Cloudflare:** [developers.cloudflare.com/pages/framework-guides/nextjs](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

**🎉 Congratulations!** Your Digital Dukan app is now live on Cloudflare Pages and ready to help Pakistani shopkeepers manage their business!
