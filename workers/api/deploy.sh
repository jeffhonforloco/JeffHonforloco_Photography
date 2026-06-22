#!/bin/sh
# Deploy Worker first, then push secrets so the deployed version can receive them.
set -e

echo "Deploying Worker..."
npx wrangler deploy

echo "Setting Worker runtime secrets..."
echo "$OPENAI_API_KEY"    | npx wrangler secret put OPENAI_API_KEY
echo "$ANTHROPIC_API_KEY" | npx wrangler secret put ANTHROPIC_API_KEY
if [ -n "$SIREIQ_HF_TOKEN" ]; then
  echo "$SIREIQ_HF_TOKEN" | npx wrangler secret put SIREIQ_HF_TOKEN
fi
if [ -n "$SIREIQ_HF_MODEL" ]; then
  echo "$SIREIQ_HF_MODEL" | npx wrangler secret put SIREIQ_HF_MODEL
fi
echo "$RESEND_API_KEY"    | npx wrangler secret put RESEND_API_KEY
echo "$JWT_SECRET"        | npx wrangler secret put JWT_SECRET
echo "$ADMIN_EMAIL"       | npx wrangler secret put ADMIN_EMAIL
echo "$ALLOWED_ORIGIN"    | npx wrangler secret put ALLOWED_ORIGIN

echo "Done."
