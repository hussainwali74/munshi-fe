#!/bin/bash

# GitHub Actions Setup Helper Script
# This script helps you gather the information needed for GitHub Secrets

echo "================================================"
echo "GitHub Actions CI/CD Setup Helper"
echo "================================================"
echo ""

echo "You need to add the following secrets to GitHub:"
echo "Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""

echo "1. CLOUDFLARE_API_TOKEN"
echo "   Get it from: https://dash.cloudflare.com/profile/api-tokens"
echo "   - Click 'Create Token'"
echo "   - Use 'Edit Cloudflare Workers' template"
echo "   - Copy the token"
echo ""

echo "2. CLOUDFLARE_ACCOUNT_ID"
echo "   Get it from: https://dash.cloudflare.com"
echo "   - Click 'Workers & Pages'"
echo "   - Your Account ID is shown on the right"
echo ""

# Try to get account ID from wrangler if available
if command -v wrangler &> /dev/null; then
    echo "   Attempting to get Account ID from wrangler..."
    ACCOUNT_ID=$(npx wrangler whoami 2>/dev/null | grep "Account ID" | awk '{print $3}')
    if [ ! -z "$ACCOUNT_ID" ]; then
        echo "   ✅ Found Account ID: $ACCOUNT_ID"
    fi
fi

echo ""
echo "3. NEXT_PUBLIC_SUPABASE_URL"
echo "   Get it from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
echo "   - Copy 'Project URL'"
echo ""

echo "4. NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   Get it from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
echo "   - Copy 'anon public' key"
echo ""

echo "================================================"
echo "Runtime Secrets (Set in Cloudflare Workers)"
echo "================================================"
echo ""
echo "After deployment, set these in Cloudflare:"
echo "Go to: https://dash.cloudflare.com → Workers & Pages → ez-khata → Settings → Variables"
echo ""
echo "Or use wrangler CLI:"
echo ""
echo "  npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY"
echo "  npx wrangler secret put R2_ACCESS_KEY_ID"
echo "  npx wrangler secret put R2_SECRET_ACCESS_KEY"
echo "  npx wrangler secret put R2_BUCKET_NAME"
echo "  npx wrangler secret put R2_PUBLIC_URL"
echo ""

echo "================================================"
echo "Next Steps"
echo "================================================"
echo ""
echo "1. Add all secrets to GitHub (see above)"
echo "2. Commit and push the workflow file:"
echo "   git add .github/workflows/deploy.yml"
echo "   git commit -m 'Add CI/CD workflow'"
echo "   git push origin main"
echo ""
echo "3. Watch the deployment:"
echo "   https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
echo ""
echo "4. Set runtime secrets in Cloudflare (see above)"
echo ""
echo "Done! 🚀"
