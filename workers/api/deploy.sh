#!/bin/sh
# Deploy Worker first, then push secrets so the deployed version can receive them.
set -e

echo "Deploying Worker..."
npx wrangler deploy

echo "Setting Worker runtime secrets..."
echo "$OPENAI_API_KEY"    | npx wrangler secret put OPENAI_API_KEY
echo "$RESEND_API_KEY"    | npx wrangler secret put RESEND_API_KEY
echo "$JWT_SECRET"        | npx wrangler secret put JWT_SECRET
echo "$ADMIN_EMAIL"       | npx wrangler secret put ADMIN_EMAIL

echo "Done."
