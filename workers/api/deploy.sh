#!/bin/sh
# Deploy Worker first, then push secrets so the deployed version can receive them.
# A secret is only pushed when its build env var is non-empty — never blank an
# existing runtime secret because the build environment doesn't define it.
set -e

echo "Deploying Worker..."
npx wrangler deploy

put_secret() {
  name="$1"
  val="$(printenv "$name" 2>/dev/null || true)"
  if [ -n "$val" ]; then
    echo "Setting $name..."
    printf '%s' "$val" | npx wrangler secret put "$name"
  else
    echo "Skipping $name (not set in build environment - keeping existing runtime value)"
  fi
}

echo "Setting Worker runtime secrets..."
put_secret OPENAI_API_KEY
put_secret ANTHROPIC_API_KEY
put_secret SIREIQ_HF_TOKEN
put_secret SIREIQ_HF_MODEL
put_secret RESEND_API_KEY
put_secret JWT_SECRET
put_secret ADMIN_EMAIL
put_secret ALLOWED_ORIGIN

echo "Done."
