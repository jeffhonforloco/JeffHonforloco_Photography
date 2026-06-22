# Deployment Workflows

Cloudflare connected builds deploy the production Pages site and API Worker from
GitHub. Do not add duplicate GitHub Actions deploy jobs for Cloudflare unless the
Cloudflare Git integration is intentionally removed.

The old GitHub Actions deploy workflows were removed because they duplicated
Cloudflare's native builds and failed when GitHub deployment secrets drifted from
the Cloudflare configuration.
