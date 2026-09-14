# Phase 5 admin subdomain deployment

## Architecture decision

Use a **second Cloudflare Pages project from this same repository** for `admin.jeffhonforlocophotos.com`. It runs `npm run build:admin` and publishes `dist-admin`. The public Pages project continues to run `npm run build` and publish `dist`.

This is one codebase, one Hono Worker API, one D1 database, one authentication system, one contacts CRM, and one analytics funnel. It is not a second backend. The separate Pages output gives the admin host a dedicated client entry, private noindex metadata, independent rollout/rollback, and no impact on public caching. The public application contains only a lightweight `/admin/*` transition bridge; private Growth Command Center modules are absent from the public build.

## Pre-deployment order

1. Merge only after CI, review, and preview QA pass.
2. Back up the production D1 database.
3. Inspect the remote migration ledger with `npx wrangler d1 migrations list photography_db --remote`. Confirm that its Phase 3 history matches the verified production schema before changing migration state.
4. During an explicitly approved deployment window, apply pending migrations from `workers/api` with `npx wrangler d1 migrations apply photography_db --remote`. Do not use `d1 execute --file` for tracked migrations because that bypasses Wrangler's ledger.
5. Deploy the existing API Worker. Do not create another Worker or D1 database.
6. Create and validate the admin Pages project on its generated `pages.dev` preview URL.
7. Attach the custom subdomain only after login, API authorization, logout, and responsive checks pass.
8. Deploy the public transition bridge only after the admin host is proven reachable.

The migration is additive. It does not replace or copy `contacts`, `analytics`, `users`, `portfolio_images`, `blog_posts`, or email tables.

## Cloudflare Pages projects

### Existing public project

- Repository: this repository
- Production branch: `main`
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Custom domain: `jeffhonforlocophotos.com`
- Keep the existing environment variables and deployment settings.

### New private admin project

- Repository: this repository
- Production branch: `main`
- Build command: `npm ci && npm run build:admin`
- Output directory: `dist-admin`
- Initial validation: Cloudflare’s generated preview domain
- Final custom domain: `admin.jeffhonforlocophotos.com`
- Environment variable `VITE_API_BASE_URL`: the existing production Worker origin (the helper adds `/api/v1` when needed)

The admin build writes `noindex, nofollow, noarchive` metadata and does not register the public service worker. Add a Cloudflare Response Header Transform Rule scoped to hostname `admin.jeffhonforlocophotos.com`:

`X-Robots-Tag: noindex, nofollow, noarchive`

This header is defense in depth; authentication remains the security boundary.

## DNS and custom domain

Use Pages → Custom domains → Set up a custom domain and enter `admin.jeffhonforlocophotos.com`. Let Cloudflare create/validate the DNS record. Do not manually point the hostname at the public project. Confirm TLS is active before testing credentials.

No DNS change is performed by this phase or its code.

## API origin and CORS

The admin uses the same Worker and D1 binding as the public site. Set the Worker secret/variable `ALLOWED_ORIGINS` to a comma-separated exact-origin list containing both:

- `https://jeffhonforlocophotos.com`
- `https://admin.jeffhonforlocophotos.com`

Keep `ALLOWED_ORIGIN` temporarily for backward compatibility; `ALLOWED_ORIGINS` takes precedence. Do not use `*` in production. The Worker allows the `Authorization` and `Content-Type` headers and protects every `/api/v1/admin/growth/*` route with both JWT authentication and the admin role check.

## Secrets and optional connectors

Keep secrets in Worker secrets, never Pages frontend variables. Existing secrets remain required. Optional Phase 5 connectors are intentionally **not connected** until their credentials and provider review are complete:

- `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL`
- `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY`
- `GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID`
- `GITHUB_APP_ID`

These names expose connection state only; secret values are never returned. A future GitHub App integration must retain the current state machine: recommendation → review → approved proposal → tested branch → PR → human merge. It must not receive permission to merge or deploy automatically.

## Authentication and session checks

Before attaching DNS, validate on the preview host:

1. An unauthenticated `/` visit moves to `/login` and renders no lead or growth data.
2. Valid admin credentials reach `/overview`.
3. A valid non-admin token receives `403` from `/api/v1/admin/growth/*`.
4. A missing, malformed, or expired token receives `401`.
5. Logout clears local session data and returns to `/login`.
6. Repeated failed login attempts receive `429` after the configured threshold.

The current application uses the existing bearer-token storage model. A future cookie migration should use an HttpOnly, Secure, SameSite cookie and CSRF protection, and should be handled as a dedicated security change rather than mixed into this deployment.

## Public `/admin` transition

Phase 5 keeps `jeffhonforlocophotos.com/admin/*` as a lightweight compatibility bridge that preserves the path suffix, query string, and hash while moving the visitor to `admin.jeffhonforlocophotos.com`. It does not import the private admin application and must not appear in public navigation.

After the admin subdomain has passed production smoke tests for at least one normal operating cycle, the client bridge may be replaced or supplemented by a hostname-and-path scoped Cloudflare Redirect Rule:

- If hostname equals `jeffhonforlocophotos.com` and path begins with `/admin`
- Redirect to `https://admin.jeffhonforlocophotos.com` while preserving the suffix and query string
- Start with HTTP `302`

Change to `301` only after authentication, bookmarks, and every admin route work consistently. Remove or disable the redirect immediately if the admin project is unavailable.

## Scheduled monitoring

The Worker configuration adds conservative queue cadences:

- Daily: critical site health and booking/funnel health
- Weekly: search review, competitor review, AI sampling, and performance snapshot
- Monthly: authority, content gap, conversion, and 30-day scorecard

Scheduled handlers create reviewable `monitoring_runs`; they do not fabricate results, crawl aggressively, edit production content, merge code, or deploy. Provider-specific execution remains behind explicit connector work.

## Rollback

1. Remove/disable the public `/admin` redirect if it was enabled.
2. Detach the admin custom domain or roll the admin Pages project back to its previous deployment.
3. Roll the API Worker back to its previous version if necessary.
4. Leave the additive D1 tables in place during application rollback; old code does not reference them.
5. If a full data rollback is required, export retained Phase 5 records first, then drop only the Phase 5 tables in a separately reviewed migration. Never restore the entire D1 database merely to remove unused additive tables.

## Production certification checklist

- Admin: 390, 768, and 1440 pixel widths
- Public regression: 390 and 1440 pixel widths
- Unauthorized, authorized, expired-token, and logout flows
- Leads and bookings come from existing contacts
- Funnel comes from existing five acquisition events
- Empty integrations show `Not connected` or `No data yet`
- Public route does not request admin/growth chunks
- Public SEO, WebMCP, service routes, booking, service worker, and scroll restoration remain unchanged
- Mobile and desktop Lighthouse remain near the approved baseline
