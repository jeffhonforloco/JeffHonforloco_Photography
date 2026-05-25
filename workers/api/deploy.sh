#!/bin/sh
# Pushes build-time environment variables into the Worker runtime as secrets,
# then deploys. Run as the Deploy command in Cloudflare Workers CI.
set -e

echo "Setting Worker runtime secrets..."
echo "$ANTHROPIC_API_KEY" | npx wrangler secret put ANTHROPIC_API_KEY
echo "$RESEND_API_KEY"    | npx wrangler secret put RESEND_API_KEY
echo "$JWT_SECRET"        | npx wrangler secret put JWT_SECRET
echo "$ADMIN_EMAIL"       | npx wrangler secret put ADMIN_EMAIL

echo "Deploying Worker..."
npx wrangler deploy
